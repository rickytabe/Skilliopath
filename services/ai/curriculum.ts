import { ai, MODEL_NAME, LearnerProfile, CurriculumModule } from "./client";
import { Type } from "@google/genai";

export async function generateCurriculum(profile: LearnerProfile): Promise<CurriculumModule[]> {
  let exactDays = 15;
  if (profile.timeline === "1 week") exactDays = 7;
  else if (profile.timeline === "2 weeks") exactDays = 14;
  else if (profile.timeline === "1 month") exactDays = 30;
  else if (profile.timeline === "3 months") exactDays = 60; // 5 days/week for 12 weeks

  const prompt = `
You are an expert curriculum designer.
Create a micro-curriculum for a user with the following profile:
Name: ${profile.name}
Current Career: ${profile.currentCareer}
Skill to Learn: ${profile.skillToLearn}
Current Level: ${profile.currentLevel}
Total Timeline: ${profile.timeline}
Skill Gaps to Address: ${profile.skillGaps.join(", ")}
Preferred Tone: ${profile.tone}

Generate EXACTLY ${exactDays} highly granular, bite-sized curriculum modules. This must be a day-by-day curriculum spanning exactly ${exactDays} days.
Requirements:
1. Order them logically from foundational (basics) to applied (advanced).
2. Keep titles in plain, engaging language (no generic "Module 1:").
3. Determine a specific "angle" for each module. Do NOT use complex technical analogies or forced jargon. Keep it incredibly simple, relatable, and easy to digest using long-lasting words.
4. Estimate a duration for each module (e.g., "1 hour", "30 mins").
5. Provide a timingLabel for each module that indicates its position in the timeline (e.g., "Week 1 - Day 1", "Week 1 - Day 2"). The last module must be labeled Day ${exactDays}.
6. CRITICAL: Do NOT generate duplicate or nearly identical modules. Every single module MUST teach a distinct, unique concept. Do not repeat the same topic across multiple days.
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            angle: { type: Type.STRING },
            estimatedDuration: { type: Type.STRING },
            timingLabel: { type: Type.STRING },
            order: { type: Type.INTEGER },
            status: { type: Type.STRING }, // "locked" | "current" | "complete"
          },
          required: ["id", "title", "angle", "estimatedDuration", "timingLabel", "order", "status"],
        },
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate curriculum");
  }

  return JSON.parse(response.text) as CurriculumModule[];
}
