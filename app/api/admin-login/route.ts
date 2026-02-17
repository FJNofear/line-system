import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false });
  }

  if (data.password_hash !== password) {
    return NextResponse.json({ success: false });
  }

  return NextResponse.json({ success: true });
}
