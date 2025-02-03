'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Users,
  CreditCard,
  AlertTriangle,
  Activity,
  TrendingUp,
} from "lucide-react"
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { PlanType } from '@/types/subscription'
import { auth } from '@/lib/firebase/config'

interface DashboardMetrics {
  totalUsers: number
  activeSubscriptions: number
  smartleadAccounts: number
  supportRequests: number
  planDistribution: {
    free: number
    pro: number
  }
  recentActivity: {
    type: string
    message: string
    timestamp: Date
  }[]
}

interface AdminCredentials {
  email: string
  password: string
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeSubscriptions: 0,
    smartleadAccounts: 0,
    supportRequests: 0,
    planDistribution: {
      free: 0,
      pro: 0
    },
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>({
    email: '',
    password: ''
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Debug: Log collection name
        console.log('Accessing collection: users')
        
        // Fetch users and their plans from Users collection (uppercase U)
        const usersRef = collection(db, 'users')  // This is correct - matches Firebase rules
        const usersQuery = query(usersRef, orderBy('createdAt', 'desc'))
        const usersSnapshot = await getDocs(usersQuery)
        
        // Debug: Log snapshot size and data
        console.log('Users snapshot size:', usersSnapshot.size)
        console.log('Raw user data:', usersSnapshot.docs.map(doc => doc.data()))
        
        let planCounts = {
          free: 0,
          pro: 0
        }
        
        let totalUsers = 0
        let activeSubscriptions = 0

        usersSnapshot.forEach((doc) => {
          const userData = doc.data()
          // Debug: Log each user's data
          console.log('Processing user:', {
            id: doc.id,
            plan: userData.plan,
            subscription: userData.subscription,
            email: userData.basicInfo?.email
          })
          
          totalUsers++

          // Check if user is pro based on either plan or subscription status
          const isPro = 
            userData.plan?.toLowerCase() === 'pro' || 
            userData.subscription?.status?.toLowerCase() === 'pro' ||
            userData.subscription?.planId === '2'

          if (isPro) {
            planCounts.pro++
            activeSubscriptions++
          } else {
            planCounts.free++
          }
        })

        // Debug: Log final counts
        console.log('Final counts:', {
          totalUsers,
          activeSubscriptions,
          planCounts
        })

        // Fetch SmartLead accounts with status check
        const smartleadRef = collection(db, 'smartlead')
        const smartleadQuery = query(smartleadRef, where('isVerified', '==', true))
        const smartleadSnapshot = await getDocs(smartleadQuery)
        const smartleadAccounts = smartleadSnapshot.size

        // Fetch pending support requests
        const supportRef = collection(db, 'emailRequests')
        const supportQuery = query(supportRef, where('status', '==', 'pending'))
        const supportSnapshot = await getDocs(supportQuery)
        const supportRequests = supportSnapshot.size

        // Update metrics
        setMetrics({
          totalUsers,
          activeSubscriptions,
          smartleadAccounts,
          supportRequests,
          planDistribution: planCounts,
          recentActivity: []
        })

        console.log('Debug Metrics:', {
          totalUsers,
          activeSubscriptions,
          planCounts,
          userData: usersSnapshot.docs.map(doc => ({
            plan: doc.data().plan,
            subscriptionStatus: doc.data().subscription?.status,
            planId: doc.data().subscription?.planId
          }))
        })

      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()

    const currentUser = auth.currentUser
    if (currentUser?.email) {
      setAdminCredentials(prev => ({
        ...prev,
        email: currentUser.email || ''
      }))
    }
  }, [])

  // Helper function to validate plan type
  const validatePlanType = (plan: string): PlanType => {
    const validPlans: PlanType[] = ['free', 'pro']
    const normalizedPlan = plan.toLowerCase() as PlanType
    return validPlans.includes(normalizedPlan) ? normalizedPlan : 'free'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Users',
      value: metrics.totalUsers,
      icon: Users,
      description: 'Total registered users',
      trend: '+12% from last month'
    },
    {
      title: 'Active Subscriptions',
      value: metrics.activeSubscriptions,
      icon: CreditCard,
      description: 'Paying customers',
      trend: '+5% from last month'
    },
    {
      title: 'SmartLead Accounts',
      value: metrics.smartleadAccounts,
      icon: Activity,
      description: 'Verified accounts',
      trend: '+8% from last month'
    },
    {
      title: 'Support Requests',
      value: metrics.supportRequests,
      icon: AlertTriangle,
      description: 'Pending requests',
      trend: '-3% from last month'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Monitor your system's performance and user activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
              <div className="text-xs text-green-400 mt-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Distribution - Now full width */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
          <CardDescription>User distribution across plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.planDistribution).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    plan === 'free' ? 'bg-gray-400' : 'bg-purple-400'
                  }`} />
                  <span className="capitalize">{plan}</span>
                </div>
                <span className="font-semibold">{count} users</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 