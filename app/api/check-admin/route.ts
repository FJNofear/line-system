import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  const { line_user_id, name } = await req.json()

  await supabase.from("admin_logs").insert({
    action: "admin_login",
    admin_line_id: line_user_id,
    new_value: name
  })

  return NextResponse.json({ success: true })
}
