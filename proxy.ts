import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ====== ไม่ต้องเช็ค path พวกนี้ ======
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  // ====== บังคับหน้าแรกเป็น login ======
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // ====== ป้องกัน /admin ======
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    try {
      // 🔐 verify JWT
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

      // 🔍 ดึง role จริงจาก Supabase
      const { data: admin, error } = await supabase
        .from("admins")
        .select("role")
        .eq("id", decoded.id)
        .single()

      if (error || !admin) {
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }

      const role = admin.role

      // ❌ dashboard เข้าได้เฉพาะ superadmin
      if (pathname.startsWith("/admin/dashboard") && role !== "superadmin") {
        return NextResponse.redirect(new URL("/admin/unauthorized", req.url))
      }

      return NextResponse.next()
    } catch (err) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
}
