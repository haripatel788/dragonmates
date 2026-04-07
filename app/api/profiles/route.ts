// Author: Patrick Melan, April 7 2026
// Mod by Patrick Melan, April 7 2026

import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// POST onboarding profile data
export async function POST(request: Request) {
  
    // take data from JSON request
    const body = await request.json();
    const { user_id, academics, living, interests } = body;

    // upsert academics data to Supabase academics table
    const academicsData = await supabaseAdmin
        .from("academics")
        .upsert({ user_id, ...academics });
    
    // upsert living style data to Supabase living_styles table
    const livingStyleData = await supabaseAdmin
        .from("living_styles")
        .upsert({ user_id, ...living });

    // upsert interests data to Supabase interests table
    const interestData = await supabaseAdmin
        .from("interests")
        .upsert({ user_id, interests });

    // assign any error messages to err variable
    const err = academicsData.error || livingStyleData.error || interestData.error;
    
    // if error exists, return error status 400 
    if (err) return NextResponse.json({ error: err.message }, { status: 400 });

    // return OK if successful
    return NextResponse.json({ ok: true });
}