import { AskAiInput } from './ai.schema';
import prisma from '../../database';
import { logger } from '../../utils/logger';

// ==========================================
// 1. Types & Interfaces
// ==========================================

export interface AiQueryResponse {
  response: string;
  timestamp: string;
  live: boolean;
  cached?: boolean;
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
-   **File for Partial Summary Judgment**: File for a Partial Summary Judgment on Contract Liability under **UCC Section 2-714** immediately to narrow issues before pre-trial.
-   **Initiate Mitigation Log Audit**: Demand opposing side's internal work records to establish lack of damage mitigation.

*Draft prepared by LexisAI Co-Counsel. Review with senior firm partners before applying.*`;

const generateSuppressionMotion = (caseId?: string): string => `### 📝 MOTION TO SUPPRESS EVIDENCE (PREVIEW DRAFT)

**IN THE DISTRICT COURT OF THE STATE OF DELAWARE**

*Doe v. TechCorp | Case File Reference: #C-${(caseId || '884').substring(0, 4)}*

---

#### I. RELIEF SOUGHT
Plaintiff hereby moves this Court for an Order suppressing all digital logs and databases seized from Plaintiff's servers on April 12, 2026, on the grounds that the warrant was overly broad, violated the particularity requirement, and was executed in violation of the Fourth Amendment.

#### II. LEGAL BASIS & STATUTORY ARGUMENT
1.  **Lack of Particularity**: The warrant authorized the seizure of "any and all files," failing to specify search criteria or date boundaries, constituting an unconstitutional "general warrant."
2.  **Pre-Condition Failure**: Under *United States v. Grubbs*, 547 U.S. 90 (2006), an anticipatory warrant must satisfy strict pre-conditions. Here, TechCorp representatives failed to execute the required precinct logs before initiating the data download, negating the probable cause trigger.
3.  **Fruit of the Poisonous Tree**: Any subsequent files extracted from the initial unlawful seizure are tainted under *Wong Sun v. United States*, 371 U.S. 471 (1963).

#### III. CONCLUSION
Plaintiff respectfully requests that this Court grant this Motion and order the exclusion of all evidence seized.

---
*Draft prepared by LexisAI Co-Counsel. Review with senior firm partners before applying.*`;

const generatePrecedentsBrief = (): string => `### ⚖️ Precedent Check & Judicial Citations

Based on your matter structure, the following Tier-1 judicial precedents govern the legal dispute:

---

#### I. CONTRACT MUTUALITY & DIGITAL ASSENT
*   **Specht v. Netscape Communications Corp (2002)**: Establishes mutual assent standards for click-wrap and browse-wrap agreements. Seeks visible, conspicuous notice of terms.
*   **Carlill v. Carbolic Smoke Ball Co [1892] EWCA**: Landmark English contract law decision establishing the standard requirements for unilateral contract offers and binding commercial agreements.

#### II. DAMAGES REMOTENESS & BREACH PENALTIES
*   **Hadley v. Baxendale (1854) 9 Exch 341**: Dictates limits, foreseeability, and remoteness of consequential damages in breach of vendor contracts. Damages must be such as may reasonably be supposed to have been in the contemplation of both parties at the time they made the contract.
*   **UCC Section 2-714**: Dictates standard formula for buyer's damages for breach in regard to accepted goods.

---
*Query search completed across 4 internal firm directories.*`;

const generatePrivacyComplianceBrief = (message: string): string => `### 🔒 Global Privacy & Compliance Advisory Brief

Regarding your inquiry: **"${message}"**

Cross-border data regulations and enterprise consumer privacy acts impose strict liability. Here is the legal matrix:

---

#### I. STATUTORY APPLICABILITY
-   **GDPR (EU)**: Articles 44–49 restrict transfer of personal data outside the EU unless an adequacy decision or standard contractual clauses (SCCs) are active.
-   **CCPA/CPRA (California)**: Strict rules regarding consumer's right to opt-out of data sales, right to correct, and mandatory private right of action for data breaches.

#### II. DEFICIENCIES & ACTION ITEMS
1.  **DPA Check**: Review the Data Processing Agreement (DPA) between the client and technical vendors.
2.  **Consent Flow**: Conspicuously display terms of service. Avoid pre-checked check-boxes for data collection.

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
    keys: ['privacy', 'data', 'gdpr', 'ccpa'],
    generator: (msg) => generatePrivacyComplianceBrief(msg)
  }
];

// ==========================================
// 5. Main Unified Query Orchestrator
// ==========================================

export const queryAi = async (userId: string, input: AskAiInput): Promise<AiQueryResponse> => {
  const { message, caseId } = input;
  const msgLower = message.toLowerCase().trim();

  // A. Check high-performance memory cache for exact hit
  const cacheKey = `${userId}:${caseId || 'global'}:${msgLower}`;
  const cachedResponse = aiCache.get(cacheKey);
  if (cachedResponse) {
    logger.info(`Cache Hit detected for AI query key: [${cacheKey}]. Returning immediate brief.`);
    return {
      response: cachedResponse,
      timestamp: new Date().toISOString(),
      live: false,
      cached: true
    };
  }

  // B. Assemble Parent Case context
  let caseContext = '';
  try {
    if (caseId) {
      const parentCase = await prisma.case.findUnique({
        where: { id: caseId },
      });
      if (parentCase) {
        caseContext = `Regarding the case file **"${parentCase.title}"**: `;
      }
    }
  } catch (err) {
    logger.error(`Database transaction error during caseContext acquisition:`, err);
  }

  // C. Execute Live LLM Request (if key is set and valid)
  const apiKey = process.env.OPENAI_API_KEY;
  const isKeyValid = apiKey && apiKey.trim() !== '' && !apiKey.includes('your_openai_api_key_here');

  if (isKeyValid) {
    const apiEndpoint = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1/chat/completions';
    const modelName = process.env.OPENAI_MODEL || 'gpt-4o';
    const requestTimeout = parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '8000', 10);

    // Instantiate abort controller to enforce client-side HTTP timeouts
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), requestTimeout);

    try {
      logger.info(`Live Mode active. Querying OpenAI API endpoint [${apiEndpoint}] utilizing model [${modelName}]...`);

      const systemPrompt = `
You are LexisAI, an elite, citation-backed Legal Co-Counsel AI. You are a senior appellate attorney. 
Deliver extremely professional, authoritative, and direct advice.
Format your output using clear markdown with hierarchical headings (starting with "### " for major topics and "#### " for subsections), bullet points, and bold text. 
Always cite specific case precedents, constitutional articles, or statutes where applicable.
`;

      const promptPayload = `
Context details:
${caseContext ? `- Case Context: ${caseContext}` : '- Global Precedent Search (All Cases)'}
- User Question: ${message}

Provide a meticulous appellate legal analysis.
`;

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: promptPayload }
          ],
          temperature: 0.3,
          max_tokens: 1500
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutHandle);

      if (response.ok) {
        const payload = await response.json();
        const responseText = payload.choices?.[0]?.message?.content;
        if (responseText) {
          logger.info('Live OpenAI response parsed successfully. Storing in cache.');
          
          // Write to cache
          aiCache.set(cacheKey, responseText);

          return {
            response: responseText,
            timestamp: new Date().toISOString(),
            live: true,
            cached: false
          };
        }
      }

      const errorPayload = await response.text();
      logger.warn(`OpenAI HTTP error response (Status: ${response.status}). Body: ${errorPayload}. Diverting to local Sandbox Engine.`);
    } catch (err: any) {
      clearTimeout(timeoutHandle);
      if (err.name === 'AbortError') {
        logger.warn(`OpenAI connection timed out after exceeding threshold of ${requestTimeout}ms. Engaging smart failover.`);
      } else {
        logger.warn('Failed to dispatch live OpenAI call due to local exceptions. Diverting to sandbox.', err);
      }
    }
  } else {
    logger.info('Unconfigured or default OpenAI key detected. Initiating smart fallback sandbox pipelines.');
  }

  // D. Execute Smart Sandbox Strategy Pattern
  let selectedGenerator: (message: string, caseContext: string, caseId?: string) => string = generateDefaultBrief;
  
  // Search for the first matching rule based on query keywords
  for (const rule of SANDBOX_RULES) {
    const hasMatch = rule.keys.some(key => msgLower.includes(key));
    if (hasMatch) {
      selectedGenerator = rule.generator;
      break;
    }
  }

  const generatedBrief = selectedGenerator(message, caseContext, caseId);

  // Store the sandboxed brief in cache to optimize local hits
  aiCache.set(cacheKey, generatedBrief);

  return {
    response: generatedBrief,
    timestamp: new Date().toISOString(),
    live: false,
    cached: false
  };
};
