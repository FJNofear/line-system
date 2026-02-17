import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Missing credentials" },
        { status: 400 }
      )
    }

    // ดึง admin จาก table
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false })
    }

    // เช็ค password แบบ plain ก่อน (เดี๋ยวค่อยทำ bcrypt ทีหลัง)
    if (data.password !== password) {
      return NextResponse.json({ success: false })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        username: data.username
      }
    })

  } catch (err) {
    return NextResponse.json({ success: false })
  }
}
