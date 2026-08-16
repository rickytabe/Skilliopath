import { NextResponse } from "next/server";
import { ai, MODEL_NAME } from "@/services/ai/client";

export async function POST(req: Request) {
  try {
    const { onboardingData, history } = await req.json();

    if (!onboardingData || !onboardingData.skillToLearn) {
      return NextResponse.json(
        { error: "onboardingData is required" },
        { status: 400 }
      );
    }

    const { name, currentCareer, skillToLearn, currentLevel, timeline } = onboardingData;

    const prompt = `
You are an expert career and digital skills diagnostician.
The user, ${name}, is a ${currentCareer} who wants to learn ${skillToLearn} in ${timeline}.
They currently identify their skill level as: ${currentLevel}.

Your goal is to figure out exactly what specific knowledge gaps they have in ${skillToLearn} by having a short chat with them.
Rules:
1. Ask ONLY ONE short question at a time.
2. Keep your responses very concise (under 2 sentences).
3. Do not be overly enthusiastic; maintain a "quiet and disciplined" professional tone.
4. If this is the start of the conversation (history is empty), ask a targeted question assessing their true baseline in ${skillToLearn} given they are a ${currentLevel}.
5. Speak in plain, extremely simple English. Do not use complex industry jargon, abstract concepts, or big words. If you must refer to a technical concept, explain it in layperson terms (e.g., instead of "digital marketing channels," say "places online like Facebook or Google where people find you").
`;

    const contents: { role: string; parts: { text: string }[] }[] = [
      { role: "user", parts: [{ text: prompt }] },
    ];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        temperature: 0.7,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("Quota")) {
      return NextResponse.json(
        { error: "AI API rate limit exceeded. Please wait a minute and try again." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: error?.message || "Failed to generate chat response" },
      { status: 500 }
    );
  }
}
