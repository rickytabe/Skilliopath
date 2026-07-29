import { ai, MODEL_NAME, LearnerProfile, CurriculumModule, LessonContent } from "./client";
import { Type } from "@google/genai";

export async function generateLesson(
  module: CurriculumModule,
  profile: LearnerProfile
): Promise<LessonContent> {
    const prompt = `
You are an expert AI tutor. Your goal is to teach a specific concept to a user.
Student Profile:
Name: ${profile.name}
Current Career: ${profile.currentCareer}
Skill to Learn: ${profile.skillToLearn}
Current Level: ${profile.currentLevel}
Tone: ${profile.tone}

Current Module to Teach:
Title: ${module.title}
Angle/Analogy to use: ${module.angle}

Instructions:
1. Write a clear and concise explanation of the module's core concept.
2. Do NOT use complex analogies or technical jargon to explain concepts. Avoid mapping concepts to rigid technical terms. Use simple, long-lasting, universally understood words. Do not force technical metaphors that add mental drain.
3. Keep the explanation under 250 words. Be engaging, direct, and use their preferred tone.
4. Generate exactly 7 short, multiple-choice quiz questions based on your explanation to thoroughly check their knowledge.
5. Provide specific, tailored feedback strings for both correct and incorrect answers (do NOT use generic "Good job!" or "Try again!"). Explain WHY they are right or wrong based on the concept.

Output the result as JSON matching the LessonContent schema.
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          moduleId: { type: Type.STRING },
          explanation: { type: Type.STRING },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
                feedbackCorrect: { type: Type.STRING },
                feedbackIncorrect: { type: Type.STRING },
              },
              required: ["question", "options", "correctIndex", "feedbackCorrect", "feedbackIncorrect"],
            },
          },
        },
        required: ["moduleId", "explanation", "quiz"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate lesson");
  }

  let rawText = response.text;
  if (rawText.startsWith("```json")) {
    rawText = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (rawText.startsWith("```")) {
    rawText = rawText.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }

  const lesson = JSON.parse(rawText.trim()) as LessonContent;
  
  // Ensure the moduleId matches the requested module
  lesson.moduleId = module.id;
  
  return lesson;
}
