"use client"

import { useEffect, useState } from "react"
import liff from "@line/liff"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function init() {
      try {
        await liff.init({ liffId: "2008957080-rlrPh6iX" })

        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }

        const userProfile = await liff.getProfile()

        setProfile(userProfile)

        await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userProfile.userId,
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl,
          }),
        })

        setLoading(false)
      } catch (err) {
        console.error(err)
      }
    }

    init()
  }, [])

  if (loading) return <h1>Loading...</h1>

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <img
        src={profile.pictureUrl}
        width={120}
        style={{ borderRadius: "50%" }}
      />
      <h2>{profile.displayName}</h2>
      <p>LINE ID: {profile.userId}</p>
    </div>
  )
}
