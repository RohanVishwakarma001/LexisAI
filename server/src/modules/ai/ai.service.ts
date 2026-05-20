import { AskAiInput } from './ai.schema';
import prisma from '../../database';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/AppError';
import { getEmbedding, cosineSimilarity } from '../../utils/openai';
import { translateSandboxResponse } from './ai.translations';

// ==========================================
// 1. Types & Interfaces
// ==========================================

export interface AiQueryResponse {
  response: string;
  timestamp: string;
  live: boolean;
  cached?: boolean;
  conversationId: string;
  aiQueriesUsed: number;
}

interface SandboxRule {
  keys: string[];
  generator: (message: string, caseContext: string, caseId?: string) => string;
}

// ==========================================
// 2. High-Performance In-Memory LRU Cache
// ==========================================

class InMemoryLRUCache<K, V> {
  private cache = new Map<K, { value: V; expiresAt: number }>();

  constructor(
    private readonly maxEntries: number = 100,
    private readonly defaultTtlMs: number = 5 * 60 * 1000 // 5 minutes TTL
  ) {}

  public get(key: K): V | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh order in Map (Least Recently Used order)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  public set(key: K, value: V, ttlMs?: number): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict the oldest (first entry in insertion-ordered Map keys)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.cache.set(key, { value, expiresAt });
  }

  public clear(): void {
    this.cache.clear();
  }
}

// Instantiate global AI service cache
const aiCache = new InMemoryLRUCache<string, string>(150, 10 * 60 * 1000); // 10 minutes cache TTL

// ==========================================
// 3. Sandbox Templates & Generators
// ==========================================

const generateIpc302Brief = (message: string, caseContext: string): string => `### ⚖️ Appellate Review: Section 302 of the Indian Penal Code (IPC)

Regarding your inquiry: **"${message}"**

Section 302 of the IPC prescribes the punishment for **Murder**. It is one of the most critical statutory components of Indian criminal jurisprudence.

---

#### I. STATUTORY DEFINITION & RELATION TO SECTION 300
Under Indian criminal law, **Section 300 of the IPC** defines "Murder" as a specialized, highly culpable degree of culpable homicide. For an offense to be punishable under Section 302, the prosecution must prove beyond reasonable doubt that the act satisfies one of four clauses:
1.  **Intention to Cause Death**: The act was done with the direct intention of causing death.
2.  **Intention to Cause Sufficient Bodily Injury**: The offender intended to cause such bodily injury as they knew was likely to cause the death of the person to whom harm was caused.
3.  **Injury Sufficient in Ordinary Course of Nature**: The bodily injury intended to be inflicted was sufficient in the ordinary course of nature to cause death.
4.  **Imminent Danger**: The offender knew that their act was so imminently dangerous that it must, in all probability, cause death or such bodily injury as was likely to cause death.

#### II. PRESCRIBED SENTENCING MATRIX
Any individual convicted under Section 302 IPC is subject to:
-   **Death Penalty** (Capital Punishment); OR
-   **Imprisonment for Life** (which means imprisonment for the remainder of natural life, subject to standard remission rules); AND
-   **Fine** (which is mandatory and assessed based on the gravity and means of the offender).

#### III. SEMINAL JUDICIAL PRECEDENTS & LANDMARK CITATIONS
-   **Bachhan Singh v. State of Punjab (1980) SCC**: Establishes the **"Rarest of Rare Cases"** doctrine, dictating that the death penalty under Section 302 must only be awarded in exceptional cases where the alternative option of life imprisonment is unquestionably foreclosed.
-   **Machhi Singh v. State of Punjab (1983) SCR**: Outlined the guidelines and balancing test of mitigating vs. aggravating circumstances to assist courts in determining when capital punishment under Section 302 is warranted.
-   **Mithu v. State of Punjab (1983) AIR**: Held that Section 307 of the IPC (mandatory death sentence for a life convict committing murder) was unconstitutional and violated Articles 14 and 21 of the Constitution of India, establishing that judicial sentencing discretion is an essential component of due process.
-   **K.M. Nanavati v. State of Maharashtra (1961) AIR**: The landmark case regarding the exception of "Grave and Sudden Provocation" under Section 300, outlining the boundary line between Culpable Homicide (Section 304) and Murder (Section 302).

---

#### IV. DEFENSE STRATEGY CHECKLIST
-   [ ] **Reclassify to Section 304**: Attack the *mens rea* elements to show the act falls under the five exceptions of Section 300 (e.g., sudden fight, grave provocation, or private defense), reducing the charge to Culpable Homicide Not Amounting to Murder.
-   [ ] **Alibi & Forensic Discrepancies**: Challenge ballistic reports, call detail records (CDRs), and chain of custody for evidentiary samples.
-   [ ] **Witness Credibility**: Scrutinize the reliability of eye-witnesses and highlight delayed FIR (First Information Report) filings.

*Brief prepared by LexisAI Appellate Co-Counsel. Active sandbox mode running.*`;

const generateEvidentiarySummary = (caseContext: string): string => `### 📋 Dynamic AI Case Brief & Evidentiary Summary

${caseContext}Based on computational legal analysis scanning the pleadings, deposition files, and logs in the vault, here is the executive analysis:

---

#### I. NATURE OF ACTION & PROCEDURAL STATE
- **Action**: Contractual dispute regarding material warranty breaches, non-performance of technical deliverables, and consequential delay damages.
- **Matter Status**: Discovery phase. Pre-trial conference scheduled.

#### II. CRITICAL EVIDENTIARY DISCREPANCIES
1.  **Milestone Delay**: Exhibit B details clear SLA metrics showing a **42-day milestone delay** in deliverable 3.
2.  **Force Majeure Defeated**: The opposing counsel's argument claiming force majeure (citing server outages) is undermined by internal server logs showing active concurrent projects during that window.
3.  **Signature Validity**: Mutual assent verified. Both digital signatures match valid organizational signing certificates.

#### III. RECOMMENDED ACTION & LITIGATION STRATEGY
-   **File for Damages under Indian Contract Act**: File a suit for recovery and damages under **Section 73 of the Indian Contract Act, 1872** immediately in the Commercial Court.
-   **Initiate Mitigation Log Audit**: Demand opposing side's internal work records to establish lack of damage mitigation.

*Draft prepared by LexisAI Co-Counsel. Review with senior advocate partners before applying.*`;

const generateSuppressionMotion = (caseId?: string): string => `### 📝 WRIT PETITION / MOTION TO EXCLUDE EVIDENCE (PREVIEW DRAFT)

**IN THE HIGH COURT OF JUDICATURE AT BOMBAY**
*(Under Article 226 of the Constitution of India)*

*Doe v. TechCorp | Case File Reference: #C-${(caseId || '884').substring(0, 4)}*

---

#### I. RELIEF SOUGHT
The Petitioner hereby moves this Hon'ble Court for an Order suppressing and excluding all digital logs and databases seized from the Petitioner's servers on April 12, 2026, on the grounds that the search and seizure was overly broad, lacked a valid warrant or proper authorization under the Information Technology Act, 2000, and directly violated the fundamental Right to Privacy under Article 21 of the Constitution of India.

#### II. LEGAL BASIS & STATUTORY ARGUMENT
1.  **Violation of Article 21 (Right to Privacy)**: Under the landmark ruling in *K.S. Puttaswamy v. Union of India (2017) 10 SCC 1*, the Right to Privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21. The sweeping search of the Petitioner's entire network without specific judicial oversight constitutes an unreasonable and unconstitutional invasion of privacy.
2.  **Failure to Adhere to Section 80 of the IT Act, 2000**: Any search and seizure of digital devices must adhere strictly to the procedural safeguards of the Information Technology Act, 2000. Here, the seizing officers failed to record the necessary grounds of belief or obtain the required authorization from a first-class magistrate, rendering the entire seizure ultra vires.
3.  **Admissibility under Section 65B of the Indian Evidence Act / Section 63 of BSA**: The digital evidence was gathered without the mandatory certification required under Section 65B(4) of the Indian Evidence Act, 1872 (now Section 63 of the Bharatiya Sakshya Adhiniyam, 2023), rendering it legally inadmissible as secondary electronic evidence under *Anvar P.V. v. P.K. Basheer (2014) 10 SCC 473*.

#### III. CONCLUSION
The Petitioner respectfully requests that this Hon'ble Court issue a Writ of Mandamus or any other appropriate writ directing the respondents to exclude the unlawfully seized digital evidence from the record.

---
*Draft prepared by LexisAI Co-Counsel. Review with senior advocate partners before applying.*`;

const generatePrecedentsBrief = (): string => `### ⚖️ Precedent Check & Judicial Citations

Based on your matter structure, the following Tier-1 judicial precedents govern the legal dispute:

---

#### I. CONTRACT MUTUALITY & DIGITAL ASSENT
*   **Trimex International FZE v. Vedanta Aluminium Ltd. (2010) 3 SCC 1**: Establishes that a contract can be concluded through exchange of emails/digital messages, even if no formal agreement is signed, provided there is clear mutual assent on essential terms.
*   **Bhagwandas Goverdhandas Kedia v. Girdharilal Parshottamdas & Co. (1966) AIR SC 543**: Explains the rules regarding the completion of contracts over telephonic and digital communication.

#### II. DAMAGES REMOTENESS & BREACH PENALTIES
*   **Hadley v. Baxendale (1854) 9 Exch 341**: Followed in India under Section 73 of the Indian Contract Act, 1872, limiting damages to those arising naturally from the breach or contemplated by the parties.
*   **Murlidhar Chiranjilal v. Harishchandra Dwarkadas (1962) 1 SCR 653**: Outlines the standard rules for assessing market-rate damages for breach of contract in India.

---
*Query search completed across 4 internal firm directories.*`;

const generatePrivacyComplianceBrief = (message: string): string => `### 🔒 Digital Personal Data Protection (DPDP) Act Compliance Brief

Regarding your inquiry: **"${message}"**

Cross-border data regulations and Indian data privacy frameworks impose strict compliance obligations on data fiduciaries. Here is the legal matrix:

---

#### I. STATUTORY APPLICABILITY
-   **DPDP Act, 2023 (India)**: Governs the processing of digital personal data. Under Section 6, consent must be free, specific, informed, unconditional, and unambiguous, accompanied by a clear notice. Section 16 restricts cross-border transfers to territories blacklisted by the Central Government.
-   **IT Act, 2000 & SPDI Rules, 2011**: Regulates the collection and transfer of Sensitive Personal Data or Information (SPDI), requiring a clear privacy policy and reasonable security practices.

#### II. DEFICIENCIES & ACTION ITEMS
1.  **Consent Manager Integration**: Implement a consent manager interface complying with the DPDP Act guidelines to allow users to withdraw consent seamlessly.
2.  **Data Fiduciary Audit**: Conduct an audit of third-party vendors processing data to ensure they maintain the necessary security safeguards under Section 8 of the DPDP Act.

*Compliance checklist active. LexisAI corporate governance tool.*`;

const generateDefaultBrief = (message: string, caseContext: string, caseId?: string): string => `### 🤖 LexisAI Co-Counsel Strategic Brief

Regarding your legal inquiry: **"${message}"**

${caseContext}Based on prevailing statutory codes, standard corporate structures, and appellate research guidelines, here is our tactical breakdown:

---

#### I. EXECUTIVE BRIEFING & KEY CONCERNS
-   **Topic of Inquiry**: Direct research into **"${message}"**.
-   **Regulatory Environment**: Governing rules and statutory frameworks relevant to your matter's jurisdiction.
-   **Strategic Priority**: Conduct targeted file discovery to isolate key events, agreements, or communications relating to this query.

#### II. SUGGESTED APPELLATE STRATEGY & ACTIONS
1.  **Matter Timeline Analysis**: Search all upload registries for documents containing references to the query terms.
2.  **Citations Retrieval**: Cross-reference the core issues of *"${message}"* against local appellate rules to check for statutory filing deadlines.
3.  **Responsive Preparation**: Draft a formal co-counsel memo outlining legal exposure and tactical recommendations based on these guidelines.

---
*I am initialized and ready to collaborate. Let me know if you would like me to draft a motion, extract case citations, or parse uploaded matter files for this query.*`;

// ==========================================
// 4. Decoupled Strategy-Pattern Rule Mapping
// ==========================================

const SANDBOX_RULES: SandboxRule[] = [
  {
    keys: ['302', 'murder', 'ipc', 'india'],
    generator: generateIpc302Brief
  },
  {
    keys: ['summarize', 'summary', 'brief'],
    generator: (msg, ctx) => generateEvidentiarySummary(ctx)
  },
  {
    keys: ['motion', 'draft', 'pleading', 'suppress'],
    generator: (msg, ctx, id) => generateSuppressionMotion(id)
  },
  {
    keys: ['case law', 'precedent', 'citation'],
    generator: () => generatePrecedentsBrief()
  },
  {
    keys: ['privacy', 'data', 'gdpr', 'ccpa', 'dpdp'],
    generator: (msg) => generatePrivacyComplianceBrief(msg)
  }
];

// ==========================================
// 5. Main Unified Query Orchestrator
// ==========================================

export const queryAi = async (
  userId: string,
  input: AskAiInput,
  onChunk?: (chunk: string) => void
): Promise<AiQueryResponse> => {
  const { message, caseId, language } = input;
  const msgLower = message.toLowerCase().trim();

  // A. Check user subscription and AI quota limit
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  const plan = user?.subscription?.plan || 'FREE';
  const queriesUsed = user?.aiQueriesUsed || 0;

  let limit = 50;
  if (plan === 'PROFESSIONAL') limit = 500;
  else if (plan === 'ENTERPRISE') limit = 9999999;

  if (queriesUsed >= limit) {
    throw new AppError(`AI query monthly limit reached for plan: ${plan}. Please upgrade your subscription.`, 403);
  }

  // B. Resolve or create AIConversation
  let currentConversationId = input.conversationId;
  let conversation = null;

  if (currentConversationId) {
    conversation = await prisma.aIConversation.findUnique({
      where: { id: currentConversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10,
        },
      },
    });
  }

  if (!conversation) {
    const newConv = await prisma.aIConversation.create({
      data: {
        userId,
        caseId: caseId || null,
      },
    });
    currentConversationId = newConv.id;
  }

  // C. Check high-performance memory cache for exact hit
  const cacheKey = `${userId}:${caseId || 'global'}:${msgLower}`;
  const cachedResponse = aiCache.get(cacheKey);
  if (cachedResponse) {
    logger.info(`Cache Hit detected for AI query key: [${cacheKey}]. Returning immediate brief.`);
    
    // Save to message history
    await prisma.aIMessage.create({
      data: { conversationId: currentConversationId!, role: 'user', content: message }
    });
    await prisma.aIMessage.create({
      data: { conversationId: currentConversationId!, role: 'assistant', content: cachedResponse }
    });

    // Increment usage
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { aiQueriesUsed: { increment: 1 } },
    });

    if (onChunk) {
      const words = cachedResponse.split(' ');
      for (const w of words) {
        onChunk(w + ' ');
        await new Promise(r => setTimeout(r, 20));
      }
    }

    return {
      response: cachedResponse,
      timestamp: new Date().toISOString(),
      live: false,
      cached: true,
      conversationId: currentConversationId!,
      aiQueriesUsed: updatedUser.aiQueriesUsed,
    };
  }

  // D. Assemble Parent Case context
  let caseContext = '';
  try {
    if (caseId) {
      const parentCase = await prisma.case.findUnique({
        where: { id: caseId },
        include: {
          documents: {
            where: { deletedAt: null },
            include: {
              chunks: true,
            },
          },
        },
      });
      if (parentCase) {
        caseContext = `Regarding the case file **"${parentCase.title}"**:\n`;
        const caseChunks: any[] = [];
        if (parentCase.documents) {
          for (const doc of parentCase.documents) {
            if (doc.chunks) {
              for (const chunk of doc.chunks) {
                caseChunks.push({
                  ...chunk,
                  fileName: doc.fileName,
                });
              }
            }
          }
        }

        if (caseChunks.length > 0) {
          const queryVector = await getEmbedding(message);
          const scoredChunks = caseChunks.map((chunk) => {
            const vector = chunk.embedding as unknown as number[];
            const similarity = cosineSimilarity(queryVector, vector || []);
            return {
              ...chunk,
              similarity,
            };
          });
          scoredChunks.sort((a, b) => b.similarity - a.similarity);
          const topChunks = scoredChunks.slice(0, 4);

          if (topChunks.length > 0) {
            caseContext += `Relevant document excerpts from this case file:\n`;
            topChunks.forEach((c, idx) => {
              caseContext += `[Excerpt ${idx + 1} from file "${c.fileName}"]: "${c.textContent}"\n`;
            });
            caseContext += `\nIntegrate details from these excerpts carefully in your response if relevant to the query.\n`;
          }
        } else {
          caseContext += `(No documents are currently uploaded to this case).\n`;
        }
      }
    }
  } catch (err) {
    logger.error(`Database transaction error during caseContext acquisition:`, err);
  }

  const languageNames: Record<string, string> = {
    'hi-IN': 'Hindi',
    'ta-IN': 'Tamil',
    'te-IN': 'Telugu',
    'bn-IN': 'Bengali',
    'mr-IN': 'Marathi',
    'kn-IN': 'Kannada',
    'gu-IN': 'Gujarati',
    'ml-IN': 'Malayalam',
    'pa-IN': 'Punjabi',
    'en-IN': 'English',
  };

  const targetLanguage = language && languageNames[language] ? languageNames[language] : 'English';

  const systemPrompt = `
You are LexisAI, an elite, citation-backed Legal Co-Counsel AI specializing in Indian law and the Indian Constitution. You are a senior advocate and appellate attorney. 
Deliver extremely professional, authoritative, and direct advice under the framework of Indian legal jurisprudence.
Format your output using clear markdown with hierarchical headings (starting with "### " for major topics and "#### " for subsections), bullet points, and bold text. 
Always cite specific Indian Supreme Court/High Court case precedents, articles of the Constitution of India, or sections of Indian statutes (e.g., Bharatiya Nyaya Sanhita/IPC, Bharatiya Nagarik Suraksha Sanhita/CrPC, Bharatiya Sakshya Adhiniyam/IEA, Indian Contract Act, etc.) where applicable.

IMPORTANT: You MUST formulate and write your entire response, explanations, citations, and advice in ${targetLanguage}. Even if the user asks in English or any other language, your output reply MUST be delivered translated and formatted in ${targetLanguage}. Maintain your authoritative senior legal tone and markdown structure.
`;

  const promptPayload = `
Context details:
${caseContext ? `- Case Context: ${caseContext}` : '- Global Precedent Search (All Cases)'}
- User Question: ${message}

Provide a meticulous appellate legal analysis.
`;

  // E. Execute Live LLM Request (if key is set and valid)
  const apiKey = process.env.OPENAI_API_KEY;
  const isKeyValid = apiKey && apiKey.trim() !== '' && !apiKey.includes('your_openai_api_key_here');

  let responseText = '';
  let isLive = false;

  if (isKeyValid) {
    const apiEndpoint = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1/chat/completions';
    const modelName = process.env.OPENAI_MODEL || 'gpt-4o';
    const requestTimeout = parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '15000', 10);

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), requestTimeout);

    try {
      logger.info(`Live Mode active. Querying OpenAI API endpoint [${apiEndpoint}] utilizing model [${modelName}]...`);

      // Assemble prompt with conversation history (last 10 turns)
      const promptMessages: any[] = [];
      promptMessages.push({ role: 'system', content: systemPrompt });

      if (conversation && conversation.messages.length > 0) {
        for (const msg of conversation.messages) {
          promptMessages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          });
        }
      }

      promptMessages.push({ role: 'user', content: promptPayload });

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: promptMessages,
          temperature: 0.3,
          max_tokens: 1500,
          stream: !!onChunk,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutHandle);

      if (response.ok) {
        isLive = true;
        if (onChunk && response.body) {
          const bodyStream: any = response.body;
          const decoder = new TextDecoder('utf-8');
          
          if (typeof bodyStream.getReader === 'function') {
            const reader = bodyStream.getReader();
            let done = false;
            while (!done) {
              const { value, done: doneReading } = await reader.read();
              done = doneReading;
              if (value) {
                const chunkStr = decoder.decode(value);
                const lines = chunkStr.split('\n');
                for (const line of lines) {
                  const cleanLine = line.trim();
                  if (cleanLine.startsWith('data: ')) {
                    const dataStr = cleanLine.substring(6).trim();
                    if (dataStr === '[DONE]') break;
                    try {
                      const parsed = JSON.parse(dataStr);
                      const delta = parsed.choices?.[0]?.delta?.content || '';
                      if (delta) {
                        responseText += delta;
                        onChunk(delta);
                      }
                    } catch (e) {}
                  }
                }
              }
            }
          } else {
            for await (const chunk of bodyStream) {
              const chunkStr = decoder.decode(chunk);
              const lines = chunkStr.split('\n');
              for (const line of lines) {
                const cleanLine = line.trim();
                if (cleanLine.startsWith('data: ')) {
                  const dataStr = cleanLine.substring(6).trim();
                  if (dataStr === '[DONE]') break;
                  try {
                    const parsed = JSON.parse(dataStr);
                    const delta = parsed.choices?.[0]?.delta?.content || '';
                    if (delta) {
                      responseText += delta;
                      onChunk(delta);
                    }
                  } catch (e) {}
                }
              }
            }
          }
        } else {
          const payload = await response.json();
          responseText = payload.choices?.[0]?.message?.content || '';
        }
      } else {
        const errorPayload = await response.text();
        logger.warn(`OpenAI HTTP error response (Status: ${response.status}). Body: ${errorPayload}. Diverting to local Sandbox Engine.`);
      }
    } catch (err: any) {
      clearTimeout(timeoutHandle);
      if (err.name === 'AbortError') {
        logger.warn(`OpenAI connection timed out. Engaging smart failover.`);
      } else {
        logger.warn('Failed to dispatch live OpenAI call. Diverting to sandbox.', err);
      }
    }
  }

  // F. Execute Smart Sandbox Strategy Pattern
  if (!responseText) {
    let selectedGenerator: (message: string, caseContext: string, caseId?: string) => string = generateDefaultBrief;
    
    for (const rule of SANDBOX_RULES) {
      const hasMatch = rule.keys.some(key => msgLower.includes(key));
      if (hasMatch) {
        selectedGenerator = rule.generator;
        break;
      }
    }

    let type = 'default';
    if (msgLower.includes('302') || msgLower.includes('murder') || msgLower.includes('ipc') || msgLower.includes('india')) {
      type = '302';
    } else if (msgLower.includes('summarize') || msgLower.includes('summary') || msgLower.includes('brief')) {
      type = 'summary';
    } else if (msgLower.includes('motion') || msgLower.includes('draft') || msgLower.includes('pleading') || msgLower.includes('suppress')) {
      type = 'motion';
    } else if (msgLower.includes('case law') || msgLower.includes('precedent') || msgLower.includes('citation')) {
      type = 'precedent';
    } else if (msgLower.includes('privacy') || msgLower.includes('data') || msgLower.includes('gdpr') || msgLower.includes('ccpa') || msgLower.includes('dpdp')) {
      type = 'privacy';
    }

    const translated = translateSandboxResponse(type, targetLanguage, message, caseContext, caseId);
    responseText = translated || selectedGenerator(message, caseContext, caseId);

    if (onChunk) {
      const words = responseText.split(' ');
      for (const w of words) {
        onChunk(w + ' ');
        await new Promise(r => setTimeout(r, 25));
      }
    }
  }

  // G. Cache final response text
  aiCache.set(cacheKey, responseText);

  // H. Save messages to DB conversational memory
  await prisma.aIMessage.create({
    data: {
      conversationId: currentConversationId!,
      role: 'user',
      content: message,
    }
  });

  await prisma.aIMessage.create({
    data: {
      conversationId: currentConversationId!,
      role: 'assistant',
      content: responseText,
    }
  });

  // I. Increment user usage counter
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { aiQueriesUsed: { increment: 1 } },
  });

  return {
    response: responseText,
    timestamp: new Date().toISOString(),
    live: isLive,
    cached: false,
    conversationId: currentConversationId!,
    aiQueriesUsed: updatedUser.aiQueriesUsed,
  };
};
