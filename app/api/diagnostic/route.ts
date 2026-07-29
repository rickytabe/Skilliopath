import { NextResponse } from "next/server";
import { generateProfile } from "@/services/ai/diagnostic";
import { supabase } from "@/lib/supabase";

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
  } catch (error) {
    console.error("Error in /api/diagnostic:", error);
    return NextResponse.json(
      { error: "Failed to generate diagnostic profile" },
      { status: 500 }
    );
  }
}
