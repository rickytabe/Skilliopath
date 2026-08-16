import OpenAI from "openai";

export const ai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_NVIDIA_API_KEY_2 || "",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export const MODEL_NAME = "nvidia/llama-3.3-nemotron-super-49b-v1.5";

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
