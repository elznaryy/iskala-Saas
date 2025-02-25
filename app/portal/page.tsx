'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { 
  Bot, 
  FileText, 
  Activity,
  Sparkles,
  Users,
  ArrowRight,
  Database,
  TrendingUp,
  Building2,
  Crown,
  MessageSquare,
  LucideIcon
} from 'lucide-react'
import { Loading } from './components/ui/loading'
import { db } from '@/lib/firebase/config'
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
  status?: 'success' | 'warning' | 'error'
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

interface BaseFeature {
  title: string
  description: string
  icon: LucideIcon
  color: string
  textColor: string
  borderColor: string
}

interface UsageFeature extends BaseFeature {
  isInfo?: false
  usage: number
  limit: number
  href?: string
}

interface InfoFeature extends BaseFeature {
  isInfo: true
  value: string
  badge?: string
  href?: string
}

interface SmartLeadStatus {
  status: 'pending' | 'active' | null
  email?: string
  submittedAt?: Date
}

type Feature = UsageFeature | InfoFeature

export default function PortalPage() {
  const { userData, loading } = useUser()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [usageData, setUsageData] = useState<any>(null)
  const [isLoadingUsage, setIsLoadingUsage] = useState(true)
  const router = useRouter()
  const [metrics, setMetrics] = useState({
    aiEmailUsage: 0,
    aiEmailLimit: 0,
    customProspectsUsage: 0,
    customProspectsLimit: 2000,
  })
  const [smartLeadStatus, setSmartLeadStatus] = useState<SmartLeadStatus>({ status: null })

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!userData?.uid) return

      try {
        setIsLoadingUsage(true)
        
        // Fetch usage data from the 'usage' collection
        const usageRef = doc(db, 'usage', userData.uid)
        const usageDoc = await getDoc(usageRef)
        const usageData = usageDoc.exists() ? usageDoc.data() : {
          aiEmailCount: 0,
          lastResetDate: new Date(),
          updatedAt: new Date()
        }
        
        // Fetch Customized Prospects usage
        const prospectsRef = collection(db, 'customizedProspects')
        const prospectsQuery = query(
          prospectsRef,
          where('userId', '==', userData.uid),
          orderBy('requestDate', 'desc')
        )
        const prospectsSnapshot = await getDocs(prospectsQuery)
        
        // Calculate total prospects requested
        const totalProspects = prospectsSnapshot.docs.reduce((total, doc) => {
          return total + (doc.data().numberOfProspects || 0)
        }, 0)

        // Set metrics with the correct AI Email usage
        setMetrics({
          aiEmailUsage: usageData.aiEmailCount || 0,
          aiEmailLimit: userData?.plan === 'pro' ? 1000 : 50,
          customProspectsUsage: totalProspects,
          customProspectsLimit: 2000,
        })

        console.log('Usage data fetched:', {
          aiEmailUsage: usageData.aiEmailCount,
          plan: userData?.plan,
          limit: userData?.plan === 'pro' ? 1000 : 50
        })

      } catch (error) {
        console.error('Error fetching usage data:', error)
      } finally {
        setIsLoadingUsage(false)
      }
    }

    fetchUsageData()
  }, [userData?.uid])

  useEffect(() => {
    const fetchSmartLeadStatus = async () => {
      if (!userData?.uid) return

      try {
        const smartLeadRef = doc(db, 'smartlead', userData.uid)
        const smartLeadDoc = await getDoc(smartLeadRef)
        
        if (smartLeadDoc.exists()) {
          const data = smartLeadDoc.data()
          setSmartLeadStatus({
            status: data.status,
            email: data.email,
            submittedAt: data.submittedAt?.toDate()
          })
        }
      } catch (error) {
        console.error('Error fetching SmartLead status:', error)
      }
    }

    fetchSmartLeadStatus()
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

  const features: Feature[] = [
    {
      title: "AI Email Usage",
      description: "Track your AI email generation usage",
      icon: Sparkles,
      usage: metrics.aiEmailUsage,
      limit: metrics.aiEmailLimit,
      href: "/portal/ai-email",
      color: "bg-blue-500/10",
      textColor: "text-blue-500",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Customized Prospects",
      description: "Monitor your prospects requests",
      icon: Database,
      usage: metrics.customProspectsUsage,
      limit: metrics.customProspectsLimit,
      href: "/portal/customized-prospects",
      color: "bg-purple-500/10",
      textColor: "text-purple-500",
      borderColor: "border-purple-500/20"
    },
    {
      title: "SmartLead",
      description: smartLeadStatus.status === 'pending' 
        ? "Your account request is being processed" 
        : smartLeadStatus.status === 'active'
        ? "Access your SmartLead Demo account"
        : "Request your SmartLead Demo account",
      icon: MessageSquare,
      isInfo: true,
      value: smartLeadStatus.status === 'active' ? 'Demo Access' : 'Request Access',
      href: "/portal/email-tool",
      color: "bg-indigo-500/10",
      textColor: "text-indigo-500",
      borderColor: "border-indigo-500/20",
      badge: 'PRO'
    },
    {
      title: "Current Plan",
      description: "Active Subscription",
      icon: Crown,
      value: userData?.plan === 'pro' ? 'Pro Plan' : 'Free Plan',
      color: "bg-yellow-500/10",
      textColor: "text-yellow-500",
      borderColor: "border-yellow-500/20",
      isInfo: true,
      badge: userData?.plan === 'pro' ? 'PRO' : 'FREE'
    },
    {
      title: "Company Info",
      description: `${userData?.basicInfo?.email || 'Not Set'}`,
      icon: Building2,
      value: userData?.basicInfo?.companyName || 'Not Set',
      color: "bg-green-500/10",
      textColor: "text-green-500",
      borderColor: "border-green-500/20",
      isInfo: true
    }
  ]

  const handleNavigation = (href: string | undefined) => {
    if (href) {
      router.push(href)
    }
  }

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
        {features.map((feature) => (
          <Card 
            key={feature.title}
            className={`${feature.color} border ${feature.borderColor}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                <feature.icon className={`w-5 h-5 ${feature.textColor}`} />
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feature.isInfo ? (
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-medium ${feature.textColor}`}>
                      {feature.value}
                    </span>
                    {feature.badge && (
                      <Badge 
                        variant="outline" 
                        className={`${feature.textColor} ${feature.borderColor}`}
                      >
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400">Usage</span>
                        <span className={feature.textColor}>
                          {feature.usage} / {feature.limit}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full">
                        <div
                          className={`h-full rounded-full ${feature.textColor.replace('text', 'bg')}`}
                          style={{
                            width: `${Math.min((feature.usage || 0) / (feature.limit || 1) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {feature.href && (
                  <Button
                    variant="outline"
                    className={`w-full ${feature.borderColor} ${feature.textColor} hover:bg-gray-800`}
                    onClick={() => handleNavigation(feature.href)}
                  >
                    Access Feature
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {userData?.plan === 'free' && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>Get unlimited access to all features and higher usage limits</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push('/portal/billing')}
            >
              View Plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}