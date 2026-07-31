import { NextResponse } from "next/server";
import { generateCurriculum } from "@/services/ai/curriculum";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const profile = await req.json();

    if (!profile || !profile.pathId || !profile.name || !profile.currentCareer || !profile.skillToLearn || !profile.skillGaps) {
      return NextResponse.json(
        { error: "Valid LearnerProfile with a pathId is required" },
        { status: 400 }
      );
    }

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

    const curriculum = await generateCurriculum(profile);

    const { data: dbModules, error } = await supabase
      .from('curriculum_modules')
      .insert(
        curriculum.map((m) => ({
          path_id: profile.pathId,
          title: m.title,
          angle: m.angle,
          timing_label: m.timingLabel,
          order_index: m.order,
          status: m.status
        }))
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
  } catch (error: unknown) {
    console.error("Error in /api/curriculum:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to generate curriculum" },
      { status: 500 }
    );
  }
}
