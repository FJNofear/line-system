"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")
  const [popupType, setPopupType] = useState<"success" | "error">("success")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setPopupType("error")
      setPopupMessage("กรุณากรอก Username และ Password ให้ครบ")
      setShowPopup(true)
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Login failed")
      }

      setPopupType("success")
      setPopupMessage("เข้าสู่ระบบสำเร็จ 🎉")
      setShowPopup(true)

      setTimeout(() => {
        router.push("/admin/dashboard")
      }, 1200)

    } catch (err: any) {
      setPopupType("error")
      setPopupMessage(err.message || "Username หรือ Password ไม่ถูกต้อง")
      setShowPopup(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">

      {/* Background Glow Effect */}
      <div className="absolute w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>

      {/* Login Card */}
      <div className="relative z-10 bg-neutral-900 border border-yellow-500/30 shadow-2xl rounded-2xl p-10 w-full max-w-md">

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://uppic.cloud/ib/LLTyVfpp4nz1XNA_1768309771.png"
            alt="Logo"
            className="w-28 mb-4 drop-shadow-lg"
          />
          <h1 className="text-yellow-400 text-2xl font-bold text-center">
            ระบบบริหารจัดการ
          </h1>
          <p className="text-gray-400 text-sm text-center">
            Survey Status System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="text-yellow-400 text-sm">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-black border border-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white transition"
              placeholder="กรอก Username"
            />
          </div>

          <div>
            <label className="text-yellow-400 text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-black border border-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white transition"
              placeholder="กรอก Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition duration-300 shadow-lg hover:shadow-yellow-500/50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>
        </form>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 animate-fadeIn">
          <div
            className={`bg-neutral-900 border rounded-xl p-6 w-80 text-center shadow-2xl ${
              popupType === "success"
                ? "border-green-500"
                : "border-red-500"
            }`}
          >
            <h2
              className={`text-lg font-bold mb-2 ${
                popupType === "success"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {popupType === "success" ? "สำเร็จ" : "ผิดพลาด"}
            </h2>
            <p className="text-gray-300">{popupMessage}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  )
}
