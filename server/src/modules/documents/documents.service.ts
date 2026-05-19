import prisma from '../../database';
import { Role } from '@prisma/client';
import { AppError } from '../../utils/AppError';
import path from 'path';
import { uploadToCloudinary, purgeFile } from '../../utils/cloudinary';
import { env } from '../../config/env';
import fs from 'fs';
import { getEmbedding, cosineSimilarity } from '../../utils/openai';
import { queueEmail } from '../notifications/queue.service';

export const getDocuments = async (userId: string, role: Role, caseId?: string) => {
  let caseFilter: any = {};
  if (role === Role.LAWYER) {
    caseFilter = { lawyerId: userId };
  } else if (role === Role.USER) {
    caseFilter = { clientId: userId };
  }

  if (caseId) {
    caseFilter.id = caseId;
  }

  return prisma.document.findMany({
    where: {
      deletedAt: null,
      case: {
        ...caseFilter,
        deletedAt: null,
      },
    },
    include: {
      case: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createDocument = async (
  userId: string,
  caseId: string,
  file: Express.Multer.File
) => {
  const parentCase = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      client: true,
      lawyer: true,
    },
  });

  if (!parentCase || parentCase.deletedAt) {
    throw new AppError('Associated case file not found', 404);
  }

  // Simulate context-aware AI text extraction and brief summarizes based on extension
  const ext = path.extname(file.originalname).toLowerCase();
  let ocrText = 'Simulated document OCR analysis transcript.';
  let aiSummary = 'Automatic AI analysis summarization complete.';

  if (ext === '.pdf') {
    ocrText =
      'COMPLAINT AND DEMAND FOR JURY TRIAL. Plaintiff Doe hereby sues Defendant TechCorp for breach of warranty and failed software delivery. Damaged expectations exceed $150,000 under Master Services Agreement Exhibit B.';
    aiSummary =
      'This document represents a formal legal complaint alleging breach of contract and software warranty failure. Key requests include a jury trial, compensatory damages, and interest.';
  } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
    ocrText =
      'METADATA SCANNER: Evidence photo captured on 2026-05-12. Location Coordinates: 40.7128 N, 74.0060 W. High-resolution scan confirms vehicle rear impact and structural frame fracture.';
    aiSummary =
      'Image file evidence showing physical scene conditions. AI analysis confirms structural rear impact collision damage and provides location metadata coordinates.';
  } else if (ext === '.txt') {
    ocrText =
      'CASE NOTES BRIEF. Internal deposition checklist: verify timeline anomalies on corporate ledger, examine ledger timestamps, and interview chief audit representative Jenkins.';
    aiSummary =
      'Internal checklist for depositions regarding audit timeline inconsistencies and potential ledger anomalies.';
  }

  // Attempt Cloudinary ingestion with a graceful local disk fallback if credentials aren't present
  let fileUrl = `/uploads/${file.filename}`;
  let publicId: string | undefined = undefined;

  const isCloudinaryConfigured = !!(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );

  if (isCloudinaryConfigured) {
    try {
      const cloudUpload = await uploadToCloudinary(file.path);
      if (cloudUpload) {
        fileUrl = cloudUpload.secure_url;
        publicId = cloudUpload.public_id;
      } else {
        throw new AppError('Cloudinary upload returned empty payload', 500);
      }
    } catch (cloudinaryError: any) {
      console.error('❌ Cloudinary cloud media storage upload failed:', cloudinaryError);
      // Ensure local file is cleaned up if it wasn't already deleted
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (unlinkError) {
        console.error('Failed to unlink local temporary multer file after failed upload:', unlinkError);
      }
      throw new AppError(`Failed to upload file to cloud storage: ${cloudinaryError.message || cloudinaryError}`, 500);
    }
  }

  const newDoc = await prisma.document.create({
    data: {
      fileName: file.originalname,
      fileUrl,
      fileType: ext.replace('.', '').toUpperCase(),
      fileSize: file.size,
      caseId,
      uploadedBy: userId,
      metadata: {
        ocrText,
        aiSummary,
        indexedAt: new Date().toISOString(),
        publicId,
      },
    },
  });

  // Generate embeddings and store chunks (Feature 3)
  try {
    const chunks: string[] = [];
    const chunkSize = 200; // split into smaller sentence-sized chunks for better similarity mapping
    for (let i = 0; i < ocrText.length; i += chunkSize) {
      chunks.push(ocrText.substring(i, i + chunkSize));
    }

    for (const chunkText of chunks) {
      const embedding = await getEmbedding(chunkText);
      await prisma.documentChunk.create({
        data: {
          documentId: newDoc.id,
          textContent: chunkText,
          embedding: embedding as any,
        },
      });
    }
  } catch (chunkError) {
    console.error('Failed to generate document chunks/embeddings:', chunkError);
  }

  // Queue Email Notifications (Feature 1)
  try {
    if (parentCase.client && parentCase.client.id !== userId) {
      await queueEmail(
        parentCase.client.email,
        'New Document Uploaded',
        `<h1>New Document Uploaded</h1><p>A new file <strong>${file.originalname}</strong> has been uploaded to Case: <strong>${parentCase.title}</strong> by the system.</p>`
      );
    }
    if (parentCase.lawyer && parentCase.lawyer.id !== userId) {
      await queueEmail(
        parentCase.lawyer.email,
        'New Document Uploaded',
        `<h1>New Document Uploaded</h1><p>A new file <strong>${file.originalname}</strong> has been uploaded to Case: <strong>${parentCase.title}</strong>.</p>`
      );
    }
  } catch (emailErr) {
    console.error('Failed to queue upload notifications:', emailErr);
  }

  return newDoc;
};

export const deleteDocument = async (documentId: string, userId: string, role: Role) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      case: true,
    },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  // Access validation
  if (
    role !== Role.ADMIN &&
    document.uploadedBy !== userId &&
    document.case.clientId !== userId
  ) {
    throw new AppError('You do not have permission to delete this document', 403);
  }

  // 1. Purge the media file from physical storage (Cloudinary or local disk)
  await purgeFile(document.fileUrl, document.metadata);

  // 2. Permanently delete the document row from the database (Hard Delete)
  return prisma.document.delete({
    where: { id: documentId },
  });
};

export const documentQA = async (documentId: string, question: string) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      chunks: true,
    },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  if (!document.chunks || document.chunks.length === 0) {
    return {
      answer: 'No text chunks indexed for this document yet. Try uploading a PDF, TXT or image.',
      sourceChunks: [],
    };
  }

  // 1. Get embedding for the question
  const questionEmbedding = await getEmbedding(question);

  // 2. Perform Cosine Similarity ranking in memory
  const scoredChunks = document.chunks.map((chunk) => {
    const chunkVector = chunk.embedding as unknown as number[];
    const similarity = cosineSimilarity(questionEmbedding, chunkVector || []);
    return {
      ...chunk,
      similarity,
    };
  });

  // Sort descending by similarity score
  scoredChunks.sort((a, b) => b.similarity - a.similarity);

  // Select top 3 matching chunks
  const topChunks = scoredChunks.slice(0, 3);
  
  // 3. Construct Context for OpenAI LLM Q&A completion
  const contextText = topChunks.map((c) => c.textContent).join('\n---\n');

  // Query OpenAI chat completions API
  const apiKey = env.OPENAI_API_KEY;
  const isDummyKey = !apiKey || apiKey.startsWith('sk-proj-your') || apiKey.includes('sk-proj-xnPzMr');

  let answerText = '';

  if (apiKey && !isDummyKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert Indian legal assistant. Answer the user's question about the provided legal document context. Be precise and ground your answer strictly in the provided document source text. If the answer is not mentioned, say 'I cannot find that in the document'.\n\n[DOCUMENT CONTENT]\n${contextText}`,
            },
            { role: 'user', content: question },
          ],
          temperature: 0.2,
          max_tokens: 800,
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        answerText = payload.choices?.[0]?.message?.content || '';
      } else {
        const errText = await response.text();
        console.error(`LLM QA completion failed: ${errText}`);
      }
    } catch (llmError) {
      console.error('LLM QA call error:', llmError);
    }
  }

  // Sandbox fallback
  if (!answerText) {
    answerText = `[Sandbox Mode Fallback Response]\nBased on the closest matched text segments: "${topChunks[0]?.textContent || ''}", it appears the document outlines specific terms or claims matching: "${question}". (Configuring a live OpenAI API key will provide high-fidelity answers).`;
  }

  return {
    answer: answerText,
    sourceChunks: topChunks.map((c) => ({ text: c.textContent, score: c.similarity })),
  };
};
