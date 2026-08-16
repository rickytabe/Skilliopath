import { NextResponse } from "next/server";
import { ai, MODEL_NAME } from "@/services/ai/client";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await ai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "You are a helpful AI assistant running on NVIDIA's Nemotron model. You keep your answers very short and conversational." },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content;

    if (!text) {
      throw new Error("Empty response from AI");
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Test AI Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
