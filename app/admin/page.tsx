"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [popup, setPopup] = useState("")
  const [searchRw12, setSearchRw12] = useState("")
  const [formVisible, setFormVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<number[]>([])
  const [formData, setFormData] = useState<any>({})

  // ✅ Session Check
  useEffect(() => {
    const logged = sessionStorage.getItem("admin_logged_in")
    if (!logged) {
      window.location.href = "/login"
    }
  }, [])

  function showPopup(message: string) {
    setPopup(message)
    setTimeout(() => setPopup(""), 3000)
  }

  function logout() {
    sessionStorage.clear()
    window.location.href = "/login"
  }

  function calculateProgress(selectedSteps: number[]) {
    const percent = Math.round((selectedSteps.length / 8) * 100)
    setProgress(percent)
  }

  function toggleStep(step: number) {
    let newSteps = [...steps]
    if (newSteps.includes(step)) {
      newSteps = newSteps.filter((s) => s !== step)
    } else {
      newSteps.push(step)
    }
    setSteps(newSteps)
    calculateProgress(newSteps)
  }

  // 🔎 Search Case
  async function searchCase() {
    if (!searchRw12) {
      showPopup("กรุณากรอก RW12")
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from("case")
      .select("*")
      .eq("rw12", searchRw12)
      .single()

    setLoading(false)

    if (error || !data) {
      showPopup("ไม่พบข้อมูล")
      return
    }

    setFormData(data)
    setFormVisible(true)
  }

  // 💾 Save
  async function saveData() {
    if (!formData.rw12) {
      showPopup("ข้อมูลไม่ครบ")
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from("case")
      .update({
        full_name: formData.full_name,
        title_deed: formData.title_deed,
        district: formData.district,
        survey_type: formData.survey_type,
        survey_date: formData.survey_date,
        phone: formData.phone,
        surveyor_name: formData.surveyor_name,
        progress: progress,
      })
      .eq("rw12", formData.rw12)

    setLoading(false)

    if (error) showPopup("บันทึกไม่สำเร็จ")
    else showPopup("บันทึกสำเร็จ")
  }

  function clearForm() {
    setFormVisible(false)
    setFormData({})
    setSteps([])
    setProgress(0)
  }

  return (
    <div className="min-h-screen bg-black text-yellow-400 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-yellow-400 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <img
            src="https://uppic.cloud/ib/LLTyVfpp4nz1XNA_1768309771.png"
            className="w-14"
          />
          <h1 className="text-xl font-bold">
            ระบบบริหารจัดการ Survey Status System
          </h1>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 px-4 py-2 rounded text-white"
        >
          Logout
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-zinc-900 p-6 rounded-xl mb-6">
        <h2 className="mb-3 font-semibold">ค้นหา Case จาก RW12</h2>
        <div className="flex gap-3">
          <input
            value={searchRw12}
            onChange={(e) => setSearchRw12(e.target.value)}
            placeholder="เช่น 345/2569"
            className="flex-1 p-2 bg-black border border-yellow-400 rounded"
          />
          <button
            onClick={searchCase}
            className="bg-yellow-400 text-black px-4 rounded"
          >
            ค้นหา
          </button>
        </div>
      </div>

      {/* FORM */}
      {formVisible && (
        <div className="bg-zinc-900 p-6 rounded-xl">

          <div className="grid grid-cols-3 gap-4 mb-6">

            <input
              value={formData.rw12 || ""}
              disabled
              className="p-2 bg-black border border-yellow-400 rounded"
            />

            <input
              type="date"
              value={formData.survey_date || ""}
              onChange={(e) =>
                setFormData({ ...formData, survey_date: e.target.value })
              }
              className="p-2 bg-black border border-yellow-400 rounded"
            />

            <input
              placeholder="ชื่อ-สกุล"
              value={formData.full_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="p-2 bg-black border border-yellow-400 rounded"
            />

            <input
              placeholder="เลขโฉนด"
              value={formData.title_deed || ""}
              onChange={(e) =>
                setFormData({ ...formData, title_deed: e.target.value })
              }
              className="p-2 bg-black border border-yellow-400 rounded"
            />

            <input
              placeholder="อำเภอ"
              value={formData.district || ""}
              onChange={(e) =>
                setFormData({ ...formData, district: e.target.value })
              }
              className="p-2 bg-black border border-yellow-400 rounded"
            />

            <input
              placeholder="ประเภทงาน"
              value={formData.survey_type || ""}
              onChange={(e) =>
                setFormData({ ...formData, survey_type: e.target.value })
              }
              className="p-2 bg-black border border-yellow-400 rounded"
            />

            <input
              placeholder="เบอร์โทร"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="p-2 bg-black border border-yellow-400 rounded"
            />

            <input
              placeholder="ผู้รังวัด"
              value={formData.surveyor_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, surveyor_name: e.target.value })
              }
              className="p-2 bg-black border border-yellow-400 rounded"
            />

          </div>

          {/* PROGRESS */}
          <div className="mb-4">
            <div className="w-full bg-gray-700 h-4 rounded">
              <div
                className="bg-yellow-400 h-4 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2">{progress}%</p>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            {[1,2,3,4,5,6,7,8].map((s) => (
              <label key={s}>
                <input
                  type="checkbox"
                  onChange={() => toggleStep(s)}
                  checked={steps.includes(s)}
                />{" "}
                Step {s}
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveData}
              className="bg-yellow-400 text-black px-6 py-2 rounded"
            >
              บันทึก
            </button>
            <button
              onClick={clearForm}
              className="bg-gray-600 text-white px-6 py-2 rounded"
            >
              ล้างข้อมูล
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center text-yellow-400">
          กำลังโหลด...
        </div>
      )}

      {popup && (
        <div className="fixed top-5 right-5 bg-yellow-400 text-black px-4 py-2 rounded">
          {popup}
        </div>
      )}
    </div>
  )
}
