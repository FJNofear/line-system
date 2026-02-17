import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ต้องใช้ service role เท่านั้น
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      registration_id,
      new_status,
      admin_line_id
    } = body

    if (!registration_id || !new_status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // 1️⃣ ดึงข้อมูลเดิม
    const { data: registration, error: fetchError } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", registration_id)
      .single()

    if (fetchError || !registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      )
    }

    const old_status = registration.status

    // 2️⃣ อัปเดตสถานะ
    const { error: updateError } = await supabase
      .from("registrations")
      .update({
        status: new_status,
        updated_at: new Date()
      })
      .eq("id", registration_id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // 3️⃣ บันทึก Log การแก้ไข
    await supabase.from("admin_logs").insert({
      admin_line_id: admin_line_id || null,
      action: "update_status",
      registration_id: registration_id,
      old_value: old_status,
      new_value: new_status,
      created_at: new Date()
    })

    // 4️⃣ ส่ง LINE แจ้งเตือน
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN

    if (token && registration.user_id) {
      await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          to: registration.user_id,
          messages: [
            {
              type: "text",
              text:
                `📢 อัปเดตสถานะงานรังวัด\n\n` +
                `เลขโฉนด: ${registration.title_deed}\n` +
                `อำเภอ: ${registration.district}\n\n` +
                `สถานะใหม่:\n${new_status}\n\n` +
                `กรุณาตรวจสอบรายละเอียดในระบบ`
            }
          ]
        })
      })
    }

    return NextResponse.json({
      success: true
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
