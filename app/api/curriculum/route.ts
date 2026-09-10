import { NextResponse } from "next/server";
import { generateCurriculum } from "@/services/ai/curriculum";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const profile = await req.json();

    if (!profile || !profile.pathId || !profile.name || !profile.currentCareer || !profile.skillToLearn || !profile.skillGaps) {
      return NextResponse.json(
        { error: "Valid LearnerProfile with a pathId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if curriculum already exists in the database
    const { data: existingModules, error: existingError } = await supabase
      .from('curriculum_modules')
      .select('*')
      .eq('path_id', profile.pathId)
      .order('order_index', { ascending: true });

    if (!existingError && existingModules && existingModules.length > 0) {
      const dbCurriculum = existingModules.map((dbM) => ({
        id: dbM.id,
        title: dbM.title,
        angle: dbM.angle,
        timingLabel: dbM.timing_label,
        order: dbM.order_index,
        status: dbM.status
      }));
      return NextResponse.json(dbCurriculum);
    }

    // --- GLOBAL CACHE CHECK ---
    const normalizedSkill = profile.skillToLearn.trim().toLowerCase();
    const normalizedCareer = profile.currentCareer.trim().toLowerCase();

    const { data: cachedCurriculum } = await supabase
      .from('global_curriculums')
      .select('modules_json')
      .eq('skill_normalized', normalizedSkill)
      .eq('career_context', normalizedCareer)
      .maybeSingle();

    let curriculum;
    if (cachedCurriculum && cachedCurriculum.modules_json) {
      curriculum = cachedCurriculum.modules_json;
      console.log(`[CACHE HIT] Curriculum found for: ${normalizedSkill} | ${normalizedCareer}`);
    } else {
      console.log(`[CACHE MISS] Generating curriculum for: ${normalizedSkill} | ${normalizedCareer}`);
      curriculum = await generateCurriculum(profile);

      // Save to global cache in background (don't await to avoid blocking)
      supabase.from('global_curriculums').insert({
        skill_normalized: normalizedSkill,
        career_context: normalizedCareer,
        modules_json: curriculum
      }).then(({ error }) => {
        if (error) console.error("Failed to update global curriculum cache:", error);
      });
    }

    const { data: dbModules, error } = await supabase
      .from('curriculum_modules')
      .insert(
        curriculum.map((m, index) => {
          // Calculate strict timing sequence to avoid AI hallucinations
          const dayNum = index + 1;
          const weekNum = Math.ceil(dayNum / 5);
          const dayOfWeek = dayNum % 5 === 0 ? 5 : dayNum % 5;
          const calculatedTimingLabel = `Week ${weekNum} - Day ${dayOfWeek}`;

          return {
            path_id: profile.pathId,
            title: m.title,
            angle: m.angle,
            timing_label: calculatedTimingLabel,
            order_index: index + 1, // Force strictly sequential order
            status: index === 0 ? "current" : "locked"
          };
        })
      )
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error("Failed to save curriculum to database");
    }

    const dbCurriculum = dbModules
      .sort((a, b) => a.order_index - b.order_index)
      .map((dbM) => ({
        id: dbM.id,
        title: dbM.title,
        angle: dbM.angle,
        timingLabel: dbM.timing_label,
        order: dbM.order_index,
        status: dbM.status
      }));

    return NextResponse.json(dbCurriculum);
  } catch (error: any) {
    console.error("Error in /api/curriculum:", error);
    
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("Quota")) {
      return NextResponse.json(
        { error: "AI API rate limit exceeded. Please wait a minute and try again." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: error?.message || "Failed to generate curriculum" },
      { status: 500 }
    );
  }
}
