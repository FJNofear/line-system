import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, status } = await req.json();

  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      to: userId,
      messages: [
        {
          type: "text",
          text: `สถานะงานของคุณอัพเดตเป็น:\n${status}`
        }
      ]
    })
  });

  return NextResponse.json({ success: true });
}
