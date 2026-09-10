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

    // 2. GLOBAL CACHE CHECK
    const normalizedTitle = module.title.trim().toLowerCase();
    const normalizedCareer = profile.currentCareer.trim().toLowerCase();

    const { data: cachedLesson } = await supabase
      .from('global_lessons')
      .select('content_json')
      .eq('module_title_normalized', normalizedTitle)
      .eq('career_context', normalizedCareer)
      .maybeSingle();

    let lesson;
    if (cachedLesson && cachedLesson.content_json) {
      lesson = cachedLesson.content_json;
      // Ensure moduleId is set correctly for this specific user's module
      lesson.moduleId = module.id;
      console.log(`[CACHE HIT] Lesson found for: ${normalizedTitle} | ${normalizedCareer}`);
    } else {
      console.log(`[CACHE MISS] Generating lesson for: ${normalizedTitle} | ${normalizedCareer}`);
      // 3. If not found or incomplete, generate it via AI
      lesson = await generateLesson(module, profile);

      // Save to global cache in background
      supabase.from('global_lessons').insert({
        module_title_normalized: normalizedTitle,
        career_context: normalizedCareer,
        content_json: lesson
      }).then(({ error }) => {
        if (error) console.error("Failed to update global lesson cache:", error);
      });
    }

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
