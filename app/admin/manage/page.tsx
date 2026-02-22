"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface CaseItem {
  id: string
  rw12: string
  full_name: string
  title_deed: string
  district: string
  survey_date: string
  current_status: string
}

export default function ManagePage() {
  const router = useRouter()

  const [cases, setCases] = useState<CaseItem[]>([])
  const [filtered, setFiltered] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [popup, setPopup] = useState<string | null>(null)
  const [editCase, setEditCase] = useState<CaseItem | null>(null)

  useEffect(() => {
    checkAuth()
    fetchCases()
  }, [])

  const checkAuth = () => {
    const token = document.cookie.includes("token=")
    if (!token) router.push("/admin/login")
  }

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/admin/case/all")
      const data = await res.json()
      setCases(data)
      setFiltered(data)
    } catch (err) {
      setPopup("โหลดข้อมูลไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const value = search.toLowerCase()
    const result = cases.filter(c =>
      c.rw12.toLowerCase().includes(value) ||
      c.full_name.toLowerCase().includes(value) ||
      c.title_deed.toLowerCase().includes(value)
    )
    setFiltered(result)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบข้อมูลนี้ใช่หรือไม่?")) return

    try {
      const res = await fetch(`/api/admin/case/${id}`, {
        method: "DELETE"
      })

      if (!res.ok) throw new Error()

      setPopup("ลบข้อมูลสำเร็จ")
      fetchCases()
    } catch {
      setPopup("เกิดข้อผิดพลาดในการลบ")
    }
  }

  const handleUpdate = async () => {
    if (!editCase) return

    try {
      const res = await fetch(`/api/admin/case/${editCase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCase)
      })

      if (!res.ok) throw new Error()

      setPopup("แก้ไขสำเร็จ")
      setEditCase(null)
      fetchCases()
    } catch {
      setPopup("แก้ไขไม่สำเร็จ")
    }
  }

  const logout = () => {
    document.cookie = "token=; Max-Age=0; path=/"
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">

      {/* Logout */}
      <div className="flex justify-end mb-6">
        <button
          onClick={logout}
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
          จัดการข้อมูลเคส
        </h1>
      </div>

      {/* Search */}
      <div className="flex justify-center gap-3 mb-6">
        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="ค้นหา RW12 / ชื่อ / โฉนด"
          className="px-4 py-2 bg-neutral-900 border border-yellow-500 rounded-lg w-80"
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
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full border border-yellow-500/30">
            <thead className="bg-yellow-500 text-black">
              <tr>
                <th className="p-3">RW12</th>
                <th>ชื่อ</th>
                <th>โฉนด</th>
                <th>อำเภอ</th>
                <th>วันที่</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t border-yellow-500/20 hover:bg-yellow-500/10 transition">
                  <td className="p-3">{c.rw12}</td>
                  <td>{c.full_name}</td>
                  <td>{c.title_deed}</td>
                  <td>{c.district}</td>
                  <td>{c.survey_date}</td>
                  <td>{c.current_status}</td>
                  <td className="flex gap-2 p-3">
                    <button
                      onClick={()=>setEditCase(c)}
                      className="bg-yellow-500 text-black px-3 py-1 rounded"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={()=>handleDelete(c.id)}
                      className="bg-red-600 px-3 py-1 rounded"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editCase && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-neutral-900 p-6 rounded-xl border border-yellow-500 w-96 space-y-4">
            <h2 className="text-yellow-400 font-bold text-xl">แก้ไขข้อมูล</h2>

            <input
              value={editCase.full_name}
              onChange={(e)=>setEditCase({...editCase, full_name:e.target.value})}
              className="input"
            />

            <input
              value={editCase.title_deed}
              onChange={(e)=>setEditCase({...editCase, title_deed:e.target.value})}
              className="input"
            />

            <select
              value={editCase.district}
              onChange={(e)=>setEditCase({...editCase, district:e.target.value})}
              className="input"
            >
              <option>เมืองหนองบัวลำภู</option>
              <option>โนนสัง</option>
              <option>นากลาง</option>
              <option>นาวัง</option>
              <option>สุวรรณคูหา</option>
              <option>ศรีบุญเรือง</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={()=>setEditCase(null)}
                className="bg-gray-600 px-3 py-1 rounded"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpdate}
                className="bg-yellow-500 text-black px-4 py-1 rounded font-bold"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup */}
      {popup && (
        <div className="fixed bottom-6 right-6 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg animate-bounce">
          {popup}
        </div>
      )}

      <style jsx>{`
        .input {
          width:100%;
          background:#000;
          border:1px solid #eab308;
          padding:8px;
          border-radius:8px;
          color:white;
        }
      `}</style>
    </div>
  )
}
