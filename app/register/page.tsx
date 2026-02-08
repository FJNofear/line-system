"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://bivufnhazqmazhrocsuz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpdnVmbmhhenFtYXpocm9jc3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTU0MzMsImV4cCI6MjA4NTE3MTQzM30.AMEKm9Y0MN290zZUKuehd6IFrm0D-ZuwQXruJRAtszs"
);

export default function RegisterPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deed, setDeed] = useState("");
  const [district, setDistrict] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  useEffect(() => {
    const init = async () => {
      await liff.init({ liffId: "2008957080-rlrPh6iX" });

      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const prof = await liff.getProfile();
      setProfile(prof);
    };

    init();
  }, []);

  const handleSubmit = async () => {
    if (!profile) return;

    if (!deed || !district) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setLoading(true);

    // 🔎 เช็คว่าผู้ใช้นี้เคยลงทะเบียนเลขโฉนดนี้แล้วหรือยัง
    const { data: existing } = await supabase
      .from("surveys")
      .select("id")
      .eq("user_id", profile.userId)
      .eq("title_deed", deed)
      .maybeSingle();

    if (existing) {
      setLoading(false);
      alert("คุณได้ลงทะเบียนเลขโฉนดนี้แล้ว");
      return;
    }

    // 💾 บันทึกข้อมูล
    const { error } = await supabase.from("surveys").insert([
      {
        user_id: profile.userId,
        display_name: profile.displayName,
        picture_url: profile.pictureUrl,
        title_deed: deed,      // สำคัญ! แก้ error null
        rw12: deed,
        district: district,
        status: "รอดำเนินการ",
      },
    ]);

    setLoading(false);

    if (error) {
      console.log(error);
      alert("เกิดข้อผิดพลาด");
    } else {
      alert("ลงทะเบียนสำเร็จ");
      setDeed("");
      setDistrict("");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6 text-green-700">

      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mb-4"></div>
            <p>กำลังบันทึกข้อมูล...</p>
          </div>
        </div>
      )}

      <img
        src="https://uppic.cloud/ib/LLTyVfpp4nz1XNA_1768309771.png"
        className="w-32 mb-4"
      />

      <h1 className="text-2xl font-bold mb-6">
        ระบบลงทะเบียน ติดตามสถานะงาน
      </h1>

      {profile && (
        <div className="bg-green-50 p-6 rounded-2xl shadow-md w-full max-w-md">

          <div className="flex flex-col items-center mb-6">
            <img
              src={profile.pictureUrl}
              className="w-24 h-24 rounded-full mb-2 border-4 border-green-500"
            />
            <p className="text-lg font-semibold">
              สวัสดีคุณ {profile.displayName}
            </p>
          </div>

          <input
            type="text"
            placeholder="เลขโฉนด"
            value={deed}
            onChange={(e) => setDeed(e.target.value)}
            className="w-full mb-4 p-3 rounded-xl border border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full mb-4 p-3 rounded-xl border border-green-400"
          >
            <option value="">เลือกอำเภอ</option>
            <option>เมืองหนองบัวลำภู</option>
            <option>โนนสัง</option>
            <option>นากลาง</option>
            <option>นาวัง</option>
            <option>สุวรรณคูหา</option>
            <option>ศรีบุญเรือง</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
          >
            ลงทะเบียน
          </button>

        </div>
      )}
    </div>
  );
}
