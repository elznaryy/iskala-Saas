'use client'

import { useUser } from '@/contexts/UserContext'

export default function TestPage() {
  const { userData, loading } = useUser()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">User Data Test</h1>
      <pre className="bg-gray-800 p-4 rounded-lg overflow-auto">
        {JSON.stringify({
          loading,
          userData: {
            uid: userData?.uid,
            email: userData?.basicInfo?.email,
            name: userData?.basicInfo?.name,
            plan: userData?.plan
          }
        }, null, 2)}
      </pre>
    </div>
  )
} 