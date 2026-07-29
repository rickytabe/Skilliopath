import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { profileId, moduleId, starsEarned, xpEarned } = await req.json();

    if (!profileId || !moduleId || typeof starsEarned !== 'number' || typeof xpEarned !== 'number') {
      return NextResponse.json(
        { error: "profileId, moduleId, starsEarned, and xpEarned are required" },
        { status: 400 }
      );
    }

    // 1. Upsert the progress for this module
    const { error: progressError } = await supabase
      .from('user_progress')
      .upsert({
        profile_id: profileId,
        module_id: moduleId,
        stars_earned: starsEarned,
        xp_earned: xpEarned
      }, { onConflict: 'profile_id,module_id' });

    if (progressError) {
      console.error("Failed to save progress:", progressError);
      throw new Error("Failed to save progress");
    }

    // 2. Fetch current profile stats to update total XP and Level
    const { data: profile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('total_xp')
      .eq('id', profileId)
      .single();

    if (profileFetchError) {
      console.error("Failed to fetch profile stats:", profileFetchError);
      throw new Error("Failed to fetch profile stats");
    }

    // Add new XP to total XP
    const newTotalXp = (profile?.total_xp || 0) + xpEarned;
    // Calculate new level (Level 1 is 0-99 XP, Level 2 is 100-199 XP, etc.)
    const newLevel = Math.floor(newTotalXp / 100) + 1;

    // 3. Update the profile
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        total_xp: newTotalXp,
        current_level: newLevel
      })
      .eq('id', profileId);

    if (profileUpdateError) {
      console.error("Failed to update profile stats:", profileUpdateError);
      throw new Error("Failed to update profile stats");
    }

    return NextResponse.json({ success: true, totalXp: newTotalXp, currentLevel: newLevel });
  } catch (error) {
    console.error("Error in /api/progress:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to save progress", details: msg },
      { status: 500 }
    );
  }
}
