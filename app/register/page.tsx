"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rw12, setRw12] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        await liff.init({
          liffId: process.env.NEXT_PUBLIC_LIFF_ID!
        });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const prof = await liff.getProfile();
        setProfile(prof);

      } catch (err) {
        console.error(err);
        setErrorMessage("LIFF โหลดไม่สำเร็จ");
      }
    };

    init();
  }, []);

  // ✅ format rw12 เป็น 345/2569 อัตโนมัติ
  const formatRw12 = (value: string) => {
    const onlyNumbers = value.replace(/[^\d]/g, "");

    if (onlyNumbers.length <= 3) {
      return onlyNumbers;
    }

    return `${onlyNumbers.slice(0, 3)}/${onlyNumbers.slice(3, 7)}`;
  };

  const handleSubmit = async () => {
    setErrorMessage("");

    if (!rw12) {
      setErrorMessage("กรุณากรอกเลข rw12");
      return;
    }

    if (!profile) {
      setErrorMessage("ไม่พบข้อมูลผู้ใช้");
      return;
    }

    setLoading(true);

    try {
      // ✅ เช็คซ้ำ rw12
      const { data: existing, error: checkError } = await supabase
        .from("case")
        .select("id")
        .eq("rw12", rw12)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        setErrorMessage("เลข rw12 นี้ถูกใช้แล้ว");
        setLoading(false);
        return;
      }

      // ✅ insert ลง table case
      const { error: insertError } = await supabase
        .from("case")
        .insert([
          {
            rw12: rw12,
            user_id: profile.userId,
            display_name: profile.displayName,
            picture_url: profile.pictureUrl
          }
        ]);

      if (insertError) throw insertError;

      setShowSuccess(true);

    } catch (err: any) {
      console.error(err);
      setErrorMessage("เกิดข้อผิดพลาด: " + err.message);
    }

    setLoading(false);
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

      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">
              ✅ ลงทะเบียนสำเร็จ
            </h2>
            <p className="mb-6">
              ระบบบันทึกข้อมูลเรียบร้อยแล้ว
            </p>
            <button
              onClick={() => liff.closeWindow()}
              className="bg-green-600 text-white px-6 py-2 rounded-xl"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      <img
        src="https://uppic.cloud/ib/LLTyVfpp4nz1XNA_1768309771.png"
        className="w-32 mb-4"
      />

      <h1 className="text-2xl font-bold mb-6 text-center">
        ระบบลงทะเบียน ติดตามสถานะงาน
      </h1>

      {profile && (
        <div className="bg-green-50 p-6 rounded-2xl shadow-md w-full max-w-md">

          <div className="flex flex-col items-center mb-6">
            <img
              src={profile.pictureUrl}
              className="w-24 h-24 rounded-full mb-2 border-4 border-green-500"
            />
            <p className="font-semibold text-lg text-center">
              สวัสดีคุณ {profile.displayName}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 text-red-600 text-center font-medium">
              {errorMessage}
            </div>
          )}

          <input
            type="text"
            placeholder="เลข rw12 (เช่น 345/2569)"
            value={rw12}
            onChange={(e) => setRw12(formatRw12(e.target.value))}
            className="w-full mb-4 p-3 rounded-xl border border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white p-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            ลงทะเบียน
          </button>

        </div>
      )}
    </div>
  );
}
