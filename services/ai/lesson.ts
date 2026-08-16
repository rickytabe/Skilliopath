import { ai, MODEL_NAME, LearnerProfile, CurriculumModule, LessonContent } from "./client";

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

You MUST return your response as a valid JSON object strictly matching this schema:
{
  "moduleId": "string",
  "explanation": "string",
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "feedbackCorrect": "string",
      "feedbackIncorrect": "string"
    }
  ]
}
`;

  const response = await ai.chat.completions.create({
    model: MODEL_NAME,
    messages: [{ role: "system", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content;

  if (!text) {
    throw new Error("Failed to generate lesson");
  }

  let rawText = text;
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
