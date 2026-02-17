"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [searchRw12, setSearchRw12] = useState("");
  const [caseData, setCaseData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("admin_login");
    if (saved === "true") setIsLogin(true);
  }, []);

  const login = async () => {
    const { data } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (data) {
      localStorage.setItem("admin_login", "true");
      setIsLogin(true);
    } else {
      alert("Username หรือ Password ไม่ถูกต้อง");
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_login");
    setIsLogin(false);
  };

  const searchCase = async () => {
    if (!searchRw12) {
      alert("กรุณากรอกเลข rw12 ให้ครบ เช่น 345/2569");
      return;
    }

    const { data } = await supabase
      .from("case")
      .select("*")
      .eq("rw12", searchRw12)
      .single();

    if (data) {
      setCaseData(data);
    } else {
      alert("ไม่พบข้อมูล");
    }
  };

  const saveData = async () => {
    if (!caseData?.rw12) return;

    await supabase
      .from("case")
      .upsert({
        ...caseData,
        progress: progress,
        step_status: steps
      });

    alert("บันทึกสำเร็จ");
  };

  const toggleStep = (step: number) => {
    let updated = [...steps];
    if (updated.includes(step)) {
      updated = updated.filter(s => s !== step);
    } else {
      updated.push(step);
    }
    setSteps(updated);
    setProgress((updated.length / 10) * 100);
  };

  if (!isLogin) {
    return (
      <div className="min-h-screen bg-black text-yellow-400 flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-xl w-80">
          <h1 className="text-xl mb-4 text-center">ADMIN LOGIN</h1>
          <input
            placeholder="Username"
            className="w-full p-2 mb-3 bg-black border border-yellow-400"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 bg-black border border-yellow-400"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={login}
            className="w-full bg-yellow-500 text-black py-2 font-bold"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-yellow-400 p-6">

      {/* LOGOUT */}
      <div className="flex justify-end">
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* ส่วนที่ 1 */}
      <div className="text-center mb-6">
        <img
          src="https://uppic.cloud/ib/LLTyVfpp4nz1XNA_1768309771.png"
          className="w-24 mx-auto mb-2"
        />
        <h1 className="text-2xl font-bold">
          ระบบบริหารจัดการ ติดตามสถานะ Survey Status System
        </h1>

        <div className="flex justify-center mt-4">
          <input
            value={searchRw12}
            onChange={(e) => setSearchRw12(e.target.value)}
            placeholder="ค้นหา rw12 เช่น 345/2569"
            className="p-2 bg-black border border-yellow-400 w-64"
          />
          <button
            onClick={searchCase}
            className="bg-yellow-500 text-black px-4 ml-2"
          >
            ค้นหา
          </button>
        </div>
      </div>

      {/* ส่วนที่ 2 */}
      {caseData && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            "rw12",
            "survey_date",
            "full_name",
            "title_deed",
            "district",
            "survey_type",
            "phone",
            "surveyor_name"
          ].map((field) => (
            <input
              key={field}
              value={caseData[field] || ""}
              onChange={(e) =>
                setCaseData({ ...caseData, [field]: e.target.value })
              }
              placeholder={field}
              className="p-2 bg-black border border-yellow-400"
            />
          ))}
        </div>
      )}

      {/* ส่วนที่ 3 */}
      {caseData && (
        <>
          <div className="mb-4">
            <div className="bg-gray-700 h-4 rounded">
              <div
                className="bg-yellow-400 h-4 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2">ความคืบหน้า {progress}%</p>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {[...Array(10)].map((_, i) => (
              <label key={i} className="flex items-center">
                <input
                  type="checkbox"
                  onChange={() => toggleStep(i + 1)}
                />
                <span className="ml-2">Step {i + 1}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={saveData}
              className="bg-yellow-500 text-black px-4 py-2"
            >
              บันทึก
            </button>
            <button
              onClick={() => setCaseData(null)}
              className="bg-gray-600 text-white px-4 py-2"
            >
              ล้างข้อมูล
            </button>
          </div>
        </>
      )}
    </div>
  );
}
