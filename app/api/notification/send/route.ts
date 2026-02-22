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
    const { case_id, notify_type } = body;

    if (!case_id || !notify_type) {
      return NextResponse.json(
        { error: "case_id and notify_type required" },
        { status: 400 }
      );
    }

    // ดึงข้อมูลเคส
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", case_id)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    // ป้องกันส่งซ้ำ
    const { data: existingNotify } = await supabase
      .from("notifications")
      .select("id")
      .eq("case_id", case_id)
      .eq("notify_type", notify_type)
      .single();

    if (existingNotify) {
      return NextResponse.json(
        { error: "Notification already sent" },
        { status: 400 }
      );
    }

    let messageText = "";
    let title = "";

    if (notify_type === "ก่อนวันรังวัด 3 วัน") {
      title = "⏰ แจ้งเตือนก่อนวันรังวัด";
      messageText = "อีก 3 วันจะถึงวันรังวัดของท่านแล้ว";
    }

    if (notify_type === "ถึงวันรังวัด") {
      title = "📅 ถึงวันรังวัดแล้ว";
      messageText = "วันนี้คือวันรังวัดของท่าน กรุณาเตรียมเอกสารให้พร้อม";
    }

    if (notify_type === "อัปเดตสถานะ") {
      title = "📌 อัปเดตสถานะงาน";
      messageText = `สถานะใหม่: ${caseData.current_status}`;
    }

    // ส่ง LINE Flex
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: caseData.line_user_id,
        messages: [
          {
            type: "flex",
            altText: title,
            contents: {
              type: "bubble",
              body: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: title,
                    weight: "bold",
                    size: "lg",
                  },
                  {
                    type: "text",
                    text: `ร.ว.12: ${caseData.rw12}`,
                    margin: "md",
                  },
                  {
                    type: "text",
                    text: messageText,
                    margin: "sm",
                    color: "#facc15",
                    wrap: true,
                  },
                  {
                    type: "text",
                    text: `วันรังวัด: ${caseData.survey_date}`,
                    margin: "sm",
                    size: "sm",
                    color: "#888888",
                  },
                ],
              },
            },
          },
        ],
      }),
    });

    // บันทึก notification log
    await supabase.from("notifications").insert({
      case_id,
      message: messageText,
      notify_type,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
