import { env } from '../config/env';
import { logger } from './logger';

export const getEmbedding = async (text: string): Promise<number[]> => {
  const apiKey = env.OPENAI_API_KEY;
  
  const isDummyKey = !apiKey || apiKey.startsWith('sk-proj-your') || apiKey.includes('sk-proj-xnPzMr');
  
  if (apiKey && !isDummyKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text
        })
      });

      if (response.ok) {
        const payload = await response.json();
        const embedding = payload.data?.[0]?.embedding;
        if (Array.isArray(embedding)) {
          return embedding;
        }
      } else {
        const errText = await response.text();
        logger.warn(`OpenAI embedding API error (Status: ${response.status}): ${errText}`);
      }
    } catch (err) {
      logger.warn('Failed to fetch live OpenAI embedding, using fallback mock embedding.', err);
    }
  }

  // Pseudo-random deterministic vector generator fallback
  const mockVector: number[] = [];
  const textLen = text.length || 1;
  for (let i = 0; i < 1536; i++) {
    const charCode = text.charCodeAt(i % textLen) || 0;
    mockVector.push(Math.sin(i + charCode) * 0.1);
  }
  return mockVector;
};

// Helper for Cosine Similarity between two float arrays
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  
  const len = Math.min(vecA.length, vecB.length);
  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0.0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
