import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()

  const { userId, displayName, pictureUrl } = body

  const { data: existingUser } = await supabase
    .from("users_profile")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (!existingUser) {
    await supabase.from("users_profile").insert([
      {
        user_id: userId,
        display_name: displayName,
        picture_url: pictureUrl,
        total_surveys: 0,
        avg_rating: 0,
      },
    ])
  } else {
    await supabase
      .from("users_profile")
      .update({
        display_name: displayName,
        picture_url: pictureUrl,
        updated_at: new Date(),
      })
      .eq("user_id", userId)
  }

  return NextResponse.json({ success: true })
}
