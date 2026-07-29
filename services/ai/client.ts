import { GoogleGenAI, Type } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export const MODEL_NAME = "gemini-2.5-flash";

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
