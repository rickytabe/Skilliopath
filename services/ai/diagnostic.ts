import { ai, MODEL_NAME, LearnerProfile } from "./client";

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
1. Refine and formalize their desired skill into a professional, concise course title (e.g., if they say "i wanna learn react", the \`skillToLearn\` should be "React Development"). Do not just repeat their raw text.
2. Extract exactly 3 specific, highly relevant digital skill gaps they need to work on. 
3. Determine the best teaching tone for them based on their communication style (e.g., "encouraging and practical", "direct and analytical").

You MUST return your response as a valid JSON object strictly matching this schema:
{
  "name": "string",
  "currentCareer": "string",
  "skillToLearn": "string",
  "currentLevel": "string",
  "timeline": "string",
  "skillGaps": ["string", "string", "string"],
  "tone": "string"
}
`;

  const messages: any[] = [
    { role: "system", content: prompt }
  ];

  for (const msg of history) {
    messages.push({
      role: msg.role === "model" ? "assistant" : "user",
      content: msg.content,
    });
  }

  messages.push({
    role: "user",
    content: "Extract the LearnerProfile JSON now. No prose."
  });

  const response = await ai.chat.completions.create({
    model: MODEL_NAME,
    messages,
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content;

  if (!text) {
    throw new Error("Failed to generate profile");
  }

  return JSON.parse(text) as LearnerProfile;
}
