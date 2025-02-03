'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider } from '@/contexts/AuthContext'
import { UserProvider } from '@/contexts/UserContext'
import { auth } from '@/lib/firebase/config'
import { Toaster } from "@/components/ui/use-toast"
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Loading } from './components/ui/loading'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  // Handle logout initiated
  useEffect(() => {
    const handleLogout = () => {
      setIsLoggingOut(true)
    }

    window.addEventListener('logout-initiated', handleLogout)
    return () => window.removeEventListener('logout-initiated', handleLogout)
  }, [])

  if (isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loading type="logout" />
      </div>
    )
  }

  return (
    <AuthProvider>
      <UserProvider>
        <div className="min-h-screen bg-gray-900">
          <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <div className={`
              fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-200 ease-in-out
              lg:relative lg:translate-x-0 mt-16 lg:mt-0
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
              <Sidebar 
                onClose={() => setIsSidebarOpen(false)}
              />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-4 lg:p-6">
                {/* Backdrop */}
                {isSidebarOpen && (
                  <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                  />
                )}

                {children}
              </div>
            </main>
          </div>
          <Toaster />
        </div>
      </UserProvider>
    </AuthProvider>
  )
}
