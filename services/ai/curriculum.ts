import { ai, MODEL_NAME, LearnerProfile, CurriculumModule } from "./client";

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

You MUST return your response as a valid JSON object strictly matching this schema:
{
  "modules": [
    {
      "id": "string (unique identifier)",
      "title": "string",
      "angle": "string",
      "estimatedDuration": "string",
      "timingLabel": "string",
      "order": 1,
      "status": "locked"
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
    throw new Error("Failed to generate curriculum");
  }

  const parsed = JSON.parse(text);
  return parsed.modules as CurriculumModule[];
}
