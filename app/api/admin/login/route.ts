import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// 🔐 สร้าง Supabase client (ใช้ SERVICE ROLE เท่านั้น)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // 🔎 ค้นหา admin จาก username
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, username, password, role")
      .eq("username", username)
      .single()

    if (error || !admin) {
      return NextResponse.json(
        { error: "Username or password incorrect" },
        { status: 401 }
      )
    }

    // 🔐 ตรวจสอบรหัสผ่าน (bcrypt)
    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Username or password incorrect" },
        { status: 401 }
      )
    }

    // 🎫 สร้าง JWT เก็บ role ไปด้วย
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    )

    const response = NextResponse.json({
      success: true,
      role: admin.role,
    })

    // 🍪 ตั้งค่า cookie
    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 วัน
    })

    return response
  } catch (error) {
    console.error("Login Error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
