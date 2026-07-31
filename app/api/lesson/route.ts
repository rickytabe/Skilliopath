import { NextResponse } from "next/server";
import { generateLesson } from "@/services/ai/lesson";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { profile, module } = await req.json();

    if (!profile || !module || !module.id) {
      return NextResponse.json(
        { error: "profile and module with an ID are required" },
        { status: 400 }
      );
    }

    // 1. Check if we already have the lesson generated in the DB
    const { data: existingModule, error: fetchError } = await supabase
      .from('curriculum_modules')
      .select('explanation, quiz')
      .eq('id', module.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Supabase fetch error:", fetchError);
    }

    if (existingModule?.explanation && existingModule?.quiz) {
      // Return cached lesson
      return NextResponse.json({
        moduleId: module.id,
        explanation: existingModule.explanation,
        quiz: existingModule.quiz
      });
    }

    // 2. If not found or incomplete, generate it via AI
    const lesson = await generateLesson(module, profile);

    const { error } = await supabase
      .from('curriculum_modules')
      .update({
        explanation: lesson.explanation,
        quiz: lesson.quiz as any,
      })
      .eq('id', module.id);

    if (error) {
      console.error("Supabase update error:", error);
      throw new Error("Failed to save lesson to database");
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error in /api/lesson:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to generate lesson content", details: msg },
      { status: 500 }
    );
  }
}
