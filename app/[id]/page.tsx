"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RatingPage() {
  const { id } = useParams();
  const [innovation, setInnovation] = useState(5);
  const [service, setService] = useState(5);
  const [done, setDone] = useState(false);

  const submitRating = async () => {
    await supabase.from("ratings").insert([
      {
        registration_id: id,
        innovation_score: innovation,
        service_score: service,
      },
    ]);

    await supabase.from("logs").insert([
      {
        type: "rating",
        registration_id: id,
        detail: `Innovation: ${innovation}, Service: ${service}`,
      },
    ]);

    setDone(true);
  };

  if (done)
    return <div className="p-6 text-center">ขอบคุณสำหรับการให้คะแนน ⭐</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">ให้คะแนนความพึงพอใจ</h1>

      <label>⭐ ด้านนวัตกรรม</label>
      <input
        type="number"
        min="1"
        max="5"
        value={innovation}
        onChange={(e) => setInnovation(Number(e.target.value))}
        className="border p-2 w-full mb-4"
      />

      <label>⭐ ด้านการบริการ</label>
      <input
        type="number"
        min="1"
        max="5"
        value={service}
        onChange={(e) => setService(Number(e.target.value))}
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={submitRating}
        className="bg-green-600 text-white p-2 w-full"
      >
        ส่งคะแนน
      </button>
    </div>
  );
}
