import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { name, currentCareer } = await req.json();

    if (!name || !currentCareer) {
      return NextResponse.json(
        { error: "name and currentCareer are required" },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        name,
        current_career: currentCareer
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error("Failed to create profile");
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in /api/profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
