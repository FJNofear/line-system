import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * ป้องกัน Build พัง ถ้า env ยังไม่ถูก inject
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

/**
 * ใช้ Service Role (Server Only)
 */
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

/**
 * =========================
 * GET → ดึงรายชื่อ admin ทั้งหมด
 * =========================
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

/**
 * =========================
 * POST → เพิ่ม admin ใหม่
 * body: { user_id: string }
 * =========================
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("admins")
      .insert([{ user_id }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

/**
 * =========================
 * DELETE → ลบ admin
 * body: { user_id: string }
 * =========================
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("admins")
      .delete()
      .eq("user_id", user_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
