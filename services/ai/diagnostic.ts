import { ai, MODEL_NAME, LearnerProfile } from "./client";
import { Type } from "@google/genai";

export async function generateProfile(
  history: { role: string; content: string }[],
  onboardingData: Record<string, string>
): Promise<LearnerProfile> {
  const { name, currentCareer, skillToLearn, currentLevel, timeline } = onboardingData;
  const prompt = `
You are an expert career and digital skills diagnostician.
We are finalizing a diagnostic conversation for a user named ${name}.
Their current career is: ${currentCareer}.
They want to learn ${skillToLearn} in ${timeline}.
Their current level is: ${currentLevel}.

Based on the conversation history, extract their profile.
Extract exactly 3 specific, highly relevant digital skill gaps they need to work on in ${skillToLearn}. 
Determine the best teaching tone for them based on their communication style (e.g., "encouraging and practical", "direct and analytical").
`;

  const contents: { role: string; parts: { text: string }[] }[] = [
    { role: "user", parts: [{ text: prompt }] }
  ];

  for (const msg of history) {
    contents.push({
      role: msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.content }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: "Extract the LearnerProfile JSON now. No prose." }]
  });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          currentCareer: { type: Type.STRING },
          skillToLearn: { type: Type.STRING },
          currentLevel: { type: Type.STRING },
          timeline: { type: Type.STRING },
          skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          tone: { type: Type.STRING },
        },
        required: ["name", "currentCareer", "skillToLearn", "currentLevel", "timeline", "skillGaps", "tone"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate profile");
  }

  return JSON.parse(response.text) as LearnerProfile;
}
