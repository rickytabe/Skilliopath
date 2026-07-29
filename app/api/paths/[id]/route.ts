import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("DELETE route called with id:", id);
    
    // 1. Fetch modules for this path
    const { data: modules } = await supabase
      .from('curriculum_modules')
      .select('id')
      .eq('path_id', id);

    if (modules && modules.length > 0) {
      const moduleIds = modules.map(m => m.id);
      
      // 2. Delete user progress for these modules
      const progressRes = await supabase
        .from('user_progress')
        .delete()
        .in('module_id', moduleIds);
      if (progressRes.error) {
        console.error("Error deleting user progress:", progressRes.error);
        throw new Error(`Progress delete error: ${progressRes.error.message}`);
      }
        
      // 3. Delete curriculum modules
      const modulesRes = await supabase
        .from('curriculum_modules')
        .delete()
        .eq('path_id', id);
      if (modulesRes.error) {
        console.error("Error deleting modules:", modulesRes.error);
        throw new Error(`Modules delete error: ${modulesRes.error.message}`);
      }
    }

    // 4. Delete the learning path
    const { error } = await supabase
      .from('learning_paths')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Supabase error deleting path:", error);
      throw new Error(`Path delete error: ${error.message}`);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting path:", error);
    return NextResponse.json({ error: "Failed to delete path", details: error?.message }, { status: 500 });
  }
}
