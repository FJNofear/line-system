import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userIds, message } = await req.json();

  if (!userIds || !message) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  for (const userId of userIds) {
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          { type: "text", text: message }
        ],
      }),
    });
  }

  return NextResponse.json({ success: true });
}
