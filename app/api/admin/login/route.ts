import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

// ใช้ SERVICE ROLE เท่านั้น
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ต้องใส่ใน Vercel Env
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

    // 🔎 ค้นหา admin
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .single()

    if (error || !admin) {
      return NextResponse.json({ success: false })
    }

    // 🔐 ตรวจรหัสผ่าน
    const passwordMatch = await bcrypt.compare(
      password,
      admin.password_hash
    )

    if (!passwordMatch) {
      return NextResponse.json({ success: false })
    }

    // ✅ Login สำเร็จ
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    })
  } catch (err) {
    console.error("LOGIN ERROR:", err)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
