import OpenAI from "openai";

export const ai = new OpenAI({
  apiKey: process.env.KIMI_AI_API_KEY || process.env.NEXT_PUBLIC_KIMI_API_KEY || "",
  baseURL: "https://api.moonshot.ai/v1",
});

export const MODEL_NAME = "kimi-k3";

/**
 * Wrapper for ai.chat.completions.create that implements automatic
 * retries with exponential backoff for 429 (Rate Limit) errors.
 */
export async function generateWithRetry(body: any, options?: any) {
  const maxRetries = 5;
  const baseDelay = 1500; // start with 1.5s

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await ai.chat.completions.create(body, options);
    } catch (error: any) {
      // Check if it's a 429 error
      const status = error?.status || error?.response?.status;
      if (status === 429 && attempt < maxRetries - 1) {
        const delay = baseDelay * (attempt + 1);
        console.warn(`[AI] Rate limit (429) hit. Concurrency limit reached. Retrying in ${delay}ms... (Attempt ${attempt + 1} of ${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      // If it's not a 429 or we ran out of retries, throw the error
      throw error;
    }
  }
  
  // Fallback (shouldn't be reached due to throw inside catch)
  return ai.chat.completions.create(body, options);
}

// ── Data Contracts ────────────────────────────────────────

export interface LearnerProfile {
  id?: string;
  pathId?: string;
  name: string;
  currentCareer: string;
  skillToLearn: string;
  currentLevel: string;
  timeline: string;
  skillGaps: string[];
  country?: string;
  continent?: string;
  tone: string;
}

export interface CurriculumModule {
  id: string;
  title: string;
  angle: string;
  estimatedDuration: string;
  timingLabel: string;
  order: number;
  status: "locked" | "current" | "complete";
}

export interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface LessonContent {
  moduleId: string;
  explanation: string;
  quiz: QuizItem[];
}
