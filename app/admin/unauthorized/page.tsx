export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-black text-yellow-400">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="mt-4">เฉพาะ Super Admin เท่านั้นที่เข้า Dashboard ได้</p>
      </div>
    </div>
  )
}
