'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { 
  Activity, 
  Users, 
  Mail, 
  Bot, 
  FileText, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { Loading } from './components/ui/loading'
import { db } from '@/lib/firebase/config'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

interface UserData {
  uid: string
  basicInfo: {
    email: string
    name: string
    companyName: string
    phoneNumber: string
    plan: string
  }
  subscription?: {
    planId: string
    status: string
  }
  plan?: string
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
  status?: 'success' | 'warning' | 'error'
}

interface UsageData {
  aiEmailUsage: {
    count: number
    lastResetDate: Date
    plan: string
    totalLeads: number
    updatedAt: Date
  }
  leadFinder: {
    count: number
    lastResetDate: Date
    lastUpdated: Date
    plan: string
    totalLeads: number
    updatedAt: Date
  }
  copyRequests: {
    count: number
    lastResetDate: Date
    plan: string
    status: string
    totalLeads: number
    updatedAt: Date
  }
  smartlead: {
    companyName: string
    email: string
    createdAt: Date
  }
}

function StatCard({ title, value, icon, description, status }: StatCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-blue-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 p-6 rounded-lg border border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 bg-gray-700/50 rounded-lg ${getStatusColor()}`}>
          {icon}
        </div>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </motion.div>
  )
}

export default function PortalPage() {
  const { userData, loading } = useUser()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [isLoadingUsage, setIsLoadingUsage] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!userData?.uid) return

      try {
        setIsLoadingUsage(true)
        
        // Fetch data from different collections
        const aiEmailRef = doc(db, 'aiEmailUsage', userData.uid)
        const leadFinderRef = doc(db, 'leadFinder', userData.uid)
        const copyRequestsRef = collection(db, 'copyRequests')
        const smartleadRef = doc(db, 'smartlead', userData.uid)
        const userRef = doc(db, 'Users', userData.uid)

        const [aiEmailDoc, leadFinderDoc, smartleadDoc, userDoc] = await Promise.all([
          getDoc(aiEmailRef),
          getDoc(leadFinderRef),
          getDoc(smartleadRef),
          getDoc(userRef)
        ])

        // Get all copy requests for this user
        const copyRequestsQuery = query(copyRequestsRef, where('userId', '==', userData.uid))
        const copyRequestsSnapshot = await getDocs(copyRequestsQuery)
        const totalCopyRequests = copyRequestsSnapshot.size

        // Get user's plan from Users collection
        const userPlan = userDoc.exists() ? userDoc.data()?.basicInfo?.plan || 'free' : 'free'

        const usageData: UsageData = {
          aiEmailUsage: aiEmailDoc.exists() ? {
            count: aiEmailDoc.data().count || 0,
            lastResetDate: aiEmailDoc.data().lastResetDate?.toDate() || new Date(),
            plan: aiEmailDoc.data().plan || userPlan,
            totalLeads: aiEmailDoc.data().totalLeads || 0,
            updatedAt: aiEmailDoc.data().updatedAt?.toDate() || new Date()
          } : {
            count: 0,
            lastResetDate: new Date(),
            plan: userPlan,
            totalLeads: 0,
            updatedAt: new Date()
          },
          leadFinder: leadFinderDoc.exists() ? {
            count: leadFinderDoc.data().count || 0,
            lastResetDate: leadFinderDoc.data().lastResetDate?.toDate() || new Date(),
            lastUpdated: leadFinderDoc.data().lastUpdated?.toDate() || new Date(),
            plan: leadFinderDoc.data().plan || userPlan,
            totalLeads: leadFinderDoc.data().totalLeads || 0,
            updatedAt: leadFinderDoc.data().updatedAt?.toDate() || new Date()
          } : {
            count: 0,
            lastResetDate: new Date(),
            lastUpdated: new Date(),
            plan: userPlan,
            totalLeads: 0,
            updatedAt: new Date()
          },
          copyRequests: {
            count: totalCopyRequests,
            lastResetDate: new Date(),
            plan: userPlan,
            status: 'active',
            totalLeads: 0,
            updatedAt: new Date()
          },
          smartlead: smartleadDoc.exists() ? {
            companyName: smartleadDoc.data().companyName || '',
            email: smartleadDoc.data().email || '',
            createdAt: smartleadDoc.data().createdAt?.toDate() || new Date()
          } : {
            companyName: '',
            email: '',
            createdAt: new Date()
          }
        }

        setUsageData(usageData)
      } catch (error) {
        console.error('Error fetching usage data:', error)
      } finally {
        setIsLoadingUsage(false)
      }
    }

    fetchUsageData()
  }, [userData?.uid])

  useEffect(() => {
    if (!userData && isLoggingOut) {
      const timer = setTimeout(() => {
        router.replace('/login')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [userData, isLoggingOut, router])

  useEffect(() => {
    const handleLogout = () => {
      setIsLoggingOut(true)
    }

    window.addEventListener('logout-initiated', handleLogout)
    return () => window.removeEventListener('logout-initiated', handleLogout)
  }, [])

  if (loading || isLoggingOut || isLoadingUsage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center"
      >
        <Loading type={isLoggingOut ? 'logout' : 'loading'} />
      </motion.div>
    )
  }

  const stats = [
    {
      title: 'AI Email Usage',
      value: usageData?.aiEmailUsage.count || 0,
      icon: <Bot className="w-6 h-6" />,
      description: `Last reset: ${usageData?.aiEmailUsage.lastResetDate.toLocaleDateString()}`,
      status: (usageData?.aiEmailUsage.count || 0) > 80 ? 'warning' : 'success'
    },
    {
      title: 'Lead Finder Usage',
      value: usageData?.leadFinder.totalLeads || 0,
      icon: <Users className="w-6 h-6" />,
      description: `Total leads found`,
      status: undefined
    },
    {
      title: 'Copy Requests',
      value: usageData?.copyRequests.count || 0,
      icon: <FileText className="w-6 h-6" />,
      description: `Total requests made`,
      status: undefined
    },
    {
      title: 'Company Info',
      value: userData?.basicInfo?.companyName || 'Not Set',
      icon: <Activity className="w-6 h-6" />,
      description: `Email: ${userData?.basicInfo?.email || 'Not Set'}`,
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {userData?.basicInfo?.name || userData?.basicInfo?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-gray-400">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-lg border border-gray-700 p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Subscription Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Current Plan</p>
                <p className="text-xs text-gray-400">Active Subscription</p>
              </div>
              <span className="text-sm font-medium capitalize bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">
                {userData?.subscription?.planId || userData?.plan || 'Free'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}