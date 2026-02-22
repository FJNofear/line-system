import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type JwtPayload = {
  id: string;
  username: string;
  role: "admin" | "superadmin";
};

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      rw12,
      survey_date,
      full_name,
      title_deed,
      district,
      survey_type,
      phone_number,
      surveyor_name,
      current_status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Case ID is required" },
        { status: 400 }
      );
    }

    // 🔍 ดึงข้อมูลเดิม
    const { data: oldCase, error: fetchError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !oldCase) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    // 🔐 เฉพาะ superadmin เปลี่ยนสถานะได้
    if (
      current_status &&
      current_status !== oldCase.current_status &&
      decoded.role !== "superadmin"
    ) {
      return NextResponse.json(
        { error: "Only superadmin can change status" },
        { status: 403 }
      );
    }

    // 📝 อัปเดตข้อมูล
    const { error: updateError } = await supabase
      .from("cases")
      .update({
        rw12,
        survey_date,
        full_name,
        title_deed,
        district,
        survey_type,
        phone_number,
        surveyor_name,
        current_status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // 📒 บันทึก log
    await supabase.from("admin_logs").insert({
      admin_id: decoded.id,
      action: "UPDATE_CASE",
      detail: `Updated case ${rw12}`,
      created_at: new Date().toISOString(),
    });

    // 🚀 ถ้ามีการเปลี่ยนสถานะ Step 3-8 ส่ง LINE Flex
    if (
      current_status &&
      current_status !== oldCase.current_status
    ) {
      const notifyStatuses = [
        "ดำเนินการพิจารณาเรื่องรังวัด",
        "อยู่ระหว่างฝ่ายทะเบียนดำเนินการแจ้งผู้ขอ",
        "รอผู้ขอมารับทราบผล สอบเขต / แบ่งแยก / รวมโฉนด",
        "อยูู่ระหว่างดำเนินการของฝ่ายทะเบียน",
        "รอผู้ขอมารับโฉนดที่ดิน",
        "นิติกรรมนี้เสร็จสิ้นแล้ว",
      ];

      if (notifyStatuses.includes(current_status)) {
        await fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            to: oldCase.line_user_id,
            messages: [
              {
                type: "flex",
                altText: "อัปเดตสถานะงานรังวัด",
                contents: {
                  type: "bubble",
                  body: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: "📌 อัปเดตสถานะงาน",
                        weight: "bold",
                        size: "lg",
                      },
                      {
                        type: "text",
                        text: `ร.ว.12: ${oldCase.rw12}`,
                        margin: "md",
                      },
                      {
                        type: "text",
                        text: `สถานะใหม่: ${current_status}`,
                        margin: "sm",
                        color: "#facc15",
                        weight: "bold",
                      },
                    ],
                  },
                },
              },
            ],
          }),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Case updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
