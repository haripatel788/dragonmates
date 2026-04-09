// Author: Patrick Melan, April 7 2026
// Mod by Patrick Melan, April 7 2026

import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// POST onboarding profile data
export async function POST(request: Request) {
  
    // take data from JSON request
    const body = await request.json();
    const { user_id, academics, living, interests } = body;

    // return error if user_id isn't included in request
    if (!user_id)
        return NextResponse.json({ error: "Error: user_id required" }, { status: 400 });

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

// GET profile data
export async function GET(request: Request) {

    // assign user_id from search parameters to user_id variable
    const user_id = new URL(request.url).searchParams.get("user_id");
    
    // return error if user_id isn't included in request
    if (!user_id)
        return NextResponse.json({ error: "Error: user_id required" }, { status: 400 });

    // get user, academics, living, and interests data from Supabase
    // wrapped in Promise.all() for efficiency
    const [user, academics, living, interests] = await Promise.all([
        supabaseAdmin.from("users").select("*").eq("id", user_id).single(),
        supabaseAdmin.from("academics").select("*").eq("user_id", user_id).single(),
        supabaseAdmin.from("living_styles").select("*").eq("user_id", user_id).single(),
        supabaseAdmin.from("interests").select("*").eq("user_id", user_id).single(),
    ]);

    // return all data in JSON object
    return NextResponse.json({
        user: user.data,
        academics: academics.data,
        living: living.data,
        interests: interests.data,
    });
}

// PATCH method used for profile editing purposes
export async function PATCH(request: Request) {
    // get any new user data from request
    // only user_id is required; the other three categories are optional
    const { user_id, academics, living, interests } = await request.json();

    // return error if user_id isn't included in request
    if (!user_id)
        return NextResponse.json({ error: "Error: user_id required" }, { status: 400 });

    // only send data to supabase if it came through in request
    if (academics)
      await supabaseAdmin.from("academics").update(academics).eq("user_id", user_id);
    if (living)
      await supabaseAdmin.from("living_styles").update(living).eq("user_id", user_id);
    if (interests)
      await supabaseAdmin.from("interests").update({ interests }).eq("user_id", user_id);

    // return JSON success
    return NextResponse.json({ ok: true });
  }