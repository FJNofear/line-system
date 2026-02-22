"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [popup, setPopup] = useState<{
    show: boolean
    message: string
    success: boolean
  }>({
    show: false,
    message: "",
    success: false,
  })

  const showPopup = (message: string, success: boolean) => {
    setPopup({
      show: true,
      message,
      success,
    })

    setTimeout(() => {
      setPopup({
        show: false,
        message: "",
        success: false,
      })
    }, 3000)
  }

  const handleLogin = async () => {
    if (!username || !password) {
      showPopup("กรุณากรอกข้อมูลให้ครบ", false)
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await res.json()

      if (data.success) {
        sessionStorage.setItem("admin_logged_in", "true")
        sessionStorage.setItem("admin_username", data.admin.username)
        sessionStorage.setItem("admin_role", data.admin.role)

        showPopup("เข้าสู่ระบบสำเร็จ", true)

        setTimeout(() => {
          router.push("/admin")
        }, 1000)
      } else {
        showPopup("Username หรือ Password ไม่ถูกต้อง", false)
      }
    } catch (error) {
      showPopup("Server Error", false)
    }

    setLoading(false)
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <img
          src="https://uppic.cloud/ib/LLTyVfpp4nz1XNA_1768309771.png"
          style={styles.logo}
          alt="logo"
        />

        <h2 style={styles.title}>ADMIN LOGIN</h2>

        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          style={styles.input}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          style={styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
        </button>

        {popup.show && (
          <div
            style={{
              ...styles.popup,
              backgroundColor: popup.success ? "#ffd700" : "#ff4444",
              color: popup.success ? "#000" : "#fff",
            }}
          >
            {popup.message}
          </div>
        )}
      </div>
    </div>
  )
}

const styles: any = {
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#000000,#111827)",
  },
  card: {
    width: 360,
    padding: 40,
    borderRadius: 20,
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 0 40px rgba(255,215,0,0.3)",
    textAlign: "center",
  },
  logo: {
    width: 100,
    marginBottom: 20,
  },
  title: {
    color: "#ffd700",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    border: "1px solid #ffd700",
    background: "#000",
    color: "#ffd700",
    fontSize: 14,
    outline: "none",
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#ffd700",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },
  popup: {
    marginTop: 15,
    padding: "10px",
    borderRadius: 8,
    fontWeight: "bold",
  },
}
