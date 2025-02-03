'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { db, auth } from '@/lib/firebase/config'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import {
  Users,
  BarChart3,
  Settings,
  CreditCard,
  Mail,
  MessageSquare,
  LogOut,
  Shield,
  Database,
  LineChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/firebase/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { userData, loading: userLoading } = useUser()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [adminData, setAdminData] = useState<any>(null)
  const [adminUsers, setAdminUsers] = useState<string[]>([])

  // First effect: Check auth state directly
  useEffect(() => {
    console.log('Setting up direct auth check')
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Direct auth state:', user?.email)
      
      if (!user) {
        console.log('No authenticated user, redirecting')
        router.push('/login')
        return
      }

      try {
        // Get all users data for admin
        const usersRef = collection(db, 'Users')
        const usersSnapshot = await getDocs(usersRef)
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('All users data:', usersData)
        setAdminData({
          users: usersData,
          currentUser: user
        })

        // Fetch admin users list
        const adminConfigDoc = await getDoc(doc(db, 'config', 'adminUsers'))
        console.log('Admin config doc exists:', adminConfigDoc.exists())
        if (adminConfigDoc.exists()) {
          const { emails } = adminConfigDoc.data()
          console.log('Admin emails from Firestore:', emails)
          setAdminUsers(emails || [])
          
          // Check if current user is admin
          if (!emails.includes(user.email?.toLowerCase())) {
            router.push('/portal')
          }
        } else {
          console.error('Admin config document does not exist')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  // Second effect: Check admin access
  useEffect(() => {
    if (!loading && adminData && adminUsers.length > 0) {
      const userEmail = adminData.currentUser?.email?.toLowerCase()
      console.log('Checking admin access for:', userEmail)

      if (!userEmail || !adminUsers.map(email => email.toLowerCase()).includes(userEmail)) {
        console.log('Not an admin user, redirecting')
        router.push('/login')
      }
    }
  }, [adminData, loading, router, adminUsers])

  const handleNavigation = (href: string, id: string) => {
    setActiveTab(id)
    router.push(href)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
        <p className="text-white">Loading...</p>
        <p className="text-sm text-gray-400 mt-2">Checking access...</p>
      </div>
    )
  }

  if (!adminData?.currentUser?.email || !adminUsers.includes(adminData.currentUser.email)) {
    return null
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      href: '/admin',
      id: 'dashboard'
    },
    {
      name: 'Users',
      icon: Users,
      href: '/admin/users',
      id: 'users'
    },
    {
      name: 'SmartLead',
      icon: Mail,
      href: '/admin/smartlead',
      id: 'smartlead'
    },
    {
      name: 'Lead Finder',
      icon: Database,
      href: '/admin/leads',
      id: 'leads'
    },
    
    {
      name: 'Support Requests',
      icon: MessageSquare,
      href: '/admin/support',
      id: 'support'
    },
    {
      name: 'Email Templates',
      icon: Mail,
      href: '/admin/email-templates',
      id: 'email-templates'
    },
   /* {
      name: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      id: 'settings'
    }*/
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-800 border-b border-gray-700 z-50">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Iskala Admin</h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-gray-400 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-16 bottom-0 w-64 bg-gray-800 border-r border-gray-700">
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.href, item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="pt-16 pl-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 