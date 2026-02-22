"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface CaseData {
  id?: string
  rw12: string
  survey_date: string
  full_name: string
  title_deed: string
  district: string
  survey_type: string
  phone_number: string
  surveyor_name: string
  current_status: string
}

export default function AdminDashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [searchRW12, setSearchRW12] = useState("")
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [popup, setPopup] = useState<{ msg: string; type: string } | null>(null)

  const districts = [
    "เมืองหนองบัวลำภู","โนนสัง","นากลาง","นาวัง","สุวรรณคูหา","ศรีบุญเรือง"
  ]

  const surveyTypes = [
    "แบ่งเเยกในนามเดิม",
    "สอบเขตโฉนดที่ดิน",
    "แบ่งกรรมสิทธ์รวม",
    "รวมโฉนดที่ดิน",
    "รวมโฉนดที่ดินและแบ่งเเยกในนามเดิม",
    "รวมโฉนดที่ดินและแบ่งกรรมสิทธ์รวม",
    "แบ่งหักเป็นที่สาธารณประโยชน์",
    "แบ่งเเยกในนามเดิมและแบ่งหักเป็นที่สาธารณประโยชน์",
    "แบ่งกรรมสิทธ์รวมและแบ่งหักเป็นที่สาธารณประโยชน์",
    "ตรวจสอบ น.ส. ๓ ก."
  ]

  const surveyors = [
    "นายณัฐพล อุทัยเลี้ยง","นายสุรชัย สอนเฒ่า","นางสาวสุจิรา เวทย์จรัส",
    "นายณัฐกร จุลทะนันท์","นายชัยมงคล คงปิ่น","นายวัชรินทร์ คาระบุตร",
    "นายอาเขตต์ ข้ามหก","นายจีรศักดิ์ ศรีสมบัติ",
    "นายอรรถไกรวิทย์ กลางหล้า","นายภาณุพงศ์ ผสมพืช"
  ]

  const statuses = [
    "รอถึงกำหนดวันนัดรังวัด",
    "ทำการรังวัดเสร็จสิ้นแล้ว",
    "ดำเนินการพิจารณาเรื่องรังวัด",
    "อยู่ระหว่างฝ่ายทะเบียนดำเนินการแจ้งผู้ขอ",
    "รอผู้ขอมารับทราบผล สอบเขต / แบ่งแยก / รวมโฉนด",
    "อยูู่ระหว่างดำเนินการของฝ่ายทะเบียน",
    "รอผู้ขอมารับโฉนดที่ดิน",
    "นิติกรรมนี้เสร็จสิ้นแล้ว",
    "งดรังวัด / เข้ามาติดต่อใหม่ภายใน 30 วัน นะ",
    "มีเหตุขัดข้อง ผู้ขอประสงค์ยกเลิกคำขอรังวัด"
  ]

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/"
    router.push("/admin/login")
  }

  const handleSearch = async () => {
    if (!searchRW12) {
      setPopup({ msg: "กรุณากรอก RW12 ให้ครบ", type: "error" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/case?rw12=${searchRW12}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setCaseData(data)
    } catch (err: any) {
      setPopup({ msg: err.message || "ไม่พบข้อมูล", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!caseData) return

    setLoading(true)
    try {
      const res = await fetch("/api/admin/case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setPopup({ msg: "บันทึกสำเร็จ 🎉", type: "success" })
    } catch (err: any) {
      setPopup({ msg: err.message || "เกิดข้อผิดพลาด", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setCaseData(null)
    setSearchRW12("")
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">

      {/* Logout */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-bold"
        >
          Logout
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <img
          src="https://uppic.cloud/ib/LLTyVfpp4nz1XNA_1768309771.png"
          className="w-24 mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-yellow-400">
          ระบบบริหารจัดการ
        </h1>
        <p className="text-gray-400">
          Survey Status System
        </p>
      </div>

      {/* Search */}
      <div className="flex justify-center gap-3 mb-8">
        <input
          value={searchRW12}
          onChange={(e) => setSearchRW12(e.target.value)}
          placeholder="ค้นหา RW12"
          className="px-4 py-2 bg-neutral-900 border border-yellow-500 rounded-lg"
        />
        <button
          onClick={handleSearch}
          className="bg-yellow-500 text-black px-6 rounded-lg font-bold"
        >
          ค้นหา
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center mb-6">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Form */}
      {caseData && (
        <div className="bg-neutral-900 p-6 rounded-2xl border border-yellow-500/30 space-y-6">

          <div className="grid grid-cols-3 gap-4">
            <input value={caseData.rw12} disabled className="input" />
            <input type="date"
              value={caseData.survey_date}
              onChange={(e)=>setCaseData({...caseData,survey_date:e.target.value})}
              className="input" />
            <input
              value={caseData.full_name}
              onChange={(e)=>setCaseData({...caseData,full_name:e.target.value})}
              className="input"
            />

            <input
              value={caseData.title_deed}
              onChange={(e)=>setCaseData({...caseData,title_deed:e.target.value})}
              className="input"
            />

            <select
              value={caseData.district}
              onChange={(e)=>setCaseData({...caseData,district:e.target.value})}
              className="input"
            >
              {districts.map(d=><option key={d}>{d}</option>)}
            </select>

            <select
              value={caseData.survey_type}
              onChange={(e)=>setCaseData({...caseData,survey_type:e.target.value})}
              className="input"
            >
              {surveyTypes.map(s=><option key={s}>{s}</option>)}
            </select>

            <input
              value={caseData.phone_number}
              onChange={(e)=>setCaseData({...caseData,phone_number:e.target.value})}
              className="input"
            />

            <select
              value={caseData.surveyor_name}
              onChange={(e)=>setCaseData({...caseData,surveyor_name:e.target.value})}
              className="input"
            >
              {surveyors.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Progress Steps */}
          <div>
            <h3 className="text-yellow-400 mb-3 font-bold">สถานะงาน</h3>
            <div className="grid grid-cols-5 gap-2">
              {statuses.map((s, i) => (
                <button
                  key={i}
                  onClick={()=>setCaseData({...caseData,current_status:s})}
                  className={`p-2 text-xs rounded-lg border ${
                    caseData.current_status===s
                      ? "bg-yellow-500 text-black border-yellow-400"
                      : "bg-black border-yellow-500"
                  }`}
                >
                  Step {i+1}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={handleClear}
              className="bg-gray-600 px-4 py-2 rounded-lg"
            >
              ล้างข้อมูล
            </button>
            <button
              onClick={handleSave}
              className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-bold"
            >
              บันทึก
            </button>
          </div>
        </div>
      )}

      {/* Popup */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-neutral-900 p-6 rounded-xl text-center border border-yellow-500">
            <p className={`mb-4 ${popup.type==="error"?"text-red-400":"text-green-400"}`}>
              {popup.msg}
            </p>
            <button
              onClick={()=>setPopup(null)}
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          background:#000;
          border:1px solid #eab308;
          padding:8px;
          border-radius:8px;
        }
      `}</style>
    </div>
  )
}
