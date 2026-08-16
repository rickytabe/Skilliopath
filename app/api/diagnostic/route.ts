import { NextResponse } from "next/server";
import { generateProfile } from "@/services/ai/diagnostic";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { onboardingData, history, profileId } = await req.json();

    if (!onboardingData || !history || !profileId) {
      return NextResponse.json(
        { error: "onboardingData, history, and profileId are required" },
        { status: 400 }
      );
    }

    const profile = await generateProfile(history, onboardingData);

    const supabase = await createClient();

    const { data: dbPath, error } = await supabase
      .from('learning_paths')
      .insert({
        profile_id: profileId,
        skill_to_learn: profile.skillToLearn,
        skill_gaps: profile.skillGaps,
        tone: profile.tone
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error("Failed to save learning path to database");
    }

    return NextResponse.json({ ...profile, id: profileId, pathId: dbPath.id });
  } catch (error: any) {
    console.error("Error in /api/diagnostic:", error);

    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("Quota")) {
      return NextResponse.json(
        { error: "AI API rate limit exceeded. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Failed to generate diagnostic profile" },
      { status: 500 }
    );
  }
}
