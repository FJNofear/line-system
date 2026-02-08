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
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await liff.init({ liffId: "2008957080-rlrPh6iX" });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const prof = await liff.getProfile();
        setProfile(prof);
      } catch (err) {
        alert("LIFF เริ่มต้นไม่สำเร็จ");
        console.error(err);
      }
    };

    init();
  }, []);

  const handleSubmit = async () => {
    if (!profile) return;

    if (!deed || !district) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      // ✅ เช็คซ้ำ: user เดิม + เลขโฉนดเดิม
      const { data: existing } = await supabase
        .from("surveys")
        .select("id")
        .eq("user_id", profile.userId)
        .eq("rw12", deed)
        .maybeSingle();

      if (existing) {
        alert("คุณได้ลงทะเบียนเลขโฉนดนี้แล้ว");
        setLoading(false);
        return;
      }

      // ✅ บันทึกข้อมูล
      const { error } = await supabase.from("surveys").insert([
        {
          user_id: profile.userId,
          rw12: deed,
          district: district,
          display_name: profile.displayName,
          picture_url: profile.pictureUrl,
          status: "รอดำเนินการ"
        }
      ]);

      if (error) throw error;

      setShowSuccess(true);
      setDeed("");
      setDistrict("");

    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6 text-green-700">

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mb-4"></div>
            <p>กำลังบันทึกข้อมูล...</p>
          </div>
        </div>
      )}

      {/* Success */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">✅ ลงทะเบียนสำเร็จ</h2>
            <button
              onClick={() => {
                setShowSuccess(false);
                liff.closeWindow();
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-xl"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Logo */}
      <img
        src="https://uppic.cloud/ib/LLTyVfpp4nz1XNA_1768309771.png"
        className="w-32 mb-4"
      />

      <h1 className="text-2xl font-bold mb-2">
        ระบบลงทะเบียน ติดตามสถานะงาน
      </h1>

      {profile && (
        <div className="bg-green-50 p-6 rounded-2xl shadow-md w-full max-w-md">

          <div className="flex flex-col items-center mb-6">
            <img
              src={profile.pictureUrl}
              className="w-24 h-24 rounded-full mb-2 border-4 border-green-500"
            />
            <p className="font-semibold text-lg">
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
            className="w-full bg-green-600 text-white p-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            ลงทะเบียน
          </button>
        </div>
      )}
    </div>
  );
}
