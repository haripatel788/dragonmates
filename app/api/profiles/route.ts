import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { user_id, academics, living, interests } = body;

  const academicsData = await supabaseAdmin
    .from("academics")
    .upsert({ user_id, ...academics });

  const livingStyleData = await supabaseAdmin
    .from("living_styles")
    .upsert({ user_id, ...living });

  const interestData = await supabaseAdmin
    .from("interests")
    .upsert({ user_id, interests });

  const err = academicsData.error || livingStyleData.error || interestData.error;
  if (err) return NextResponse.json({ error: err.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}