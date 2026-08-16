import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get("filter") || "global"; // 'global', 'continent', 'country'
    const filterValue = searchParams.get("value") || "";

    const supabase = await createClient();
    
    // Check if country/continent columns exist by doing a limit 1 query
    // This makes the API robust if the user hasn't run the SQL migration yet.
    let hasLocationColumns = true;
    const { error: testError } = await supabase.from('profiles').select('country, continent').limit(1);
    if (testError && testError.code === '42703') { // 42703 is undefined_column in Postgres
      hasLocationColumns = false;
    }

    let selectQuery = hasLocationColumns 
      ? 'id, name, avatar_url, total_xp, current_level, current_career, country, continent'
      : 'id, name, avatar_url, total_xp, current_level, current_career';

    let query = supabase.from('profiles').select(selectQuery);

    if (hasLocationColumns && filterType !== 'global' && filterValue) {
      if (filterType === 'continent') {
        query = query.eq('continent', filterValue);
      } else if (filterType === 'country') {
        query = query.eq('country', filterValue);
      }
    }

    const { data, error } = await query
      .order('total_xp', { ascending: false })
      .limit(100);

    if (error) {
      console.error("Leaderboard fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      leaderboard: data || [],
      hasLocationColumns
    });

  } catch (error: any) {
    console.error("Leaderboard exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
