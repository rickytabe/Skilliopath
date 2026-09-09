import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pathId = searchParams.get("pathId");

    if (!pathId) {
      return NextResponse.json({ error: "pathId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the learning path and verify ownership
    const { data: path, error: pathError } = await supabase
      .from("learning_paths")
      .select("*")
      .eq("id", pathId)
      .eq("profile_id", user.id)
      .single();

    if (pathError || !path) {
      return NextResponse.json({ error: "Path not found or unauthorized" }, { status: 404 });
    }

    // Fetch all modules for this path
    const { data: modules } = await supabase
      .from("curriculum_modules")
      .select("id, status")
      .eq("path_id", pathId)
      .order("order_index", { ascending: true });

    if (!modules || modules.length === 0) {
      return NextResponse.json({ error: "No modules found for this path" }, { status: 404 });
    }

    // Check if ALL modules are complete
    const allComplete = modules.every((m) => m.status === "complete");
    if (!allComplete) {
      return NextResponse.json(
        { error: "Not all modules are complete. You must finish every module to earn your certificate." },
        { status: 403 }
      );
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .single();

    // Fetch progress data for XP and stars
    const { data: progress } = await supabase
      .from("user_progress")
      .select("xp_earned, stars_earned, module_id")
      .eq("profile_id", user.id);

    // Calculate stats scoped to this path's modules
    const moduleIds = new Set(modules.map((m) => m.id));
    const pathProgress = (progress || []).filter((p) => moduleIds.has(p.module_id));

    const totalXp = pathProgress.reduce((sum, p) => sum + (p.xp_earned || 0), 0);
    const totalStars = pathProgress.reduce((sum, p) => sum + (p.stars_earned || 0), 0);
    const avgStars = pathProgress.length > 0 ? (totalStars / pathProgress.length).toFixed(1) : "0";

    // Find the latest completion date
    const { data: latestProgress } = await supabase
      .from("user_progress")
      .select("created_at")
      .eq("profile_id", user.id)
      .in("module_id", modules.map((m) => m.id))
      .order("created_at", { ascending: false })
      .limit(1);

    const completionDate = latestProgress?.[0]?.created_at || new Date().toISOString();

    return NextResponse.json({
      certificateId: pathId.slice(0, 8).toUpperCase(),
      userName: profile?.name || "Learner",
      avatarUrl: profile?.avatar_url || null,
      skillName: path.skill_to_learn,
      completionDate,
      totalModules: modules.length,
      totalXp,
      avgStars,
      pathId,
    });
  } catch (error: any) {
    console.error("Certificate API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
