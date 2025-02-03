'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { db } from '@/lib/firebase/config'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { toast } from "@/components/ui/use-toast"
import { hasSmartLeadAccess } from '@/lib/utils/planUtils'

interface SmartleadCredentials {
  apiKey: string
  apiUrl: string
  isVerified: boolean
}

export default function IskalaEmailTool() {
  const { userData, loading: userLoading } = useUser()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [credentials, setCredentials] = useState<SmartleadCredentials>({
    apiKey: '',
    apiUrl: '',
    isVerified: false
  })

  useEffect(() => {
    if (userData?.uid) {
      fetchCredentials()
    } else {
      setIsLoading(false)
    }
  }, [userData?.uid])

  const fetchCredentials = async () => {
    try {
      if (!userData?.uid) return

      const docRef = doc(db, 'smartlead', userData.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        setCredentials({
          apiKey: data.apiKey || '',
          apiUrl: data.apiUrl || '',
          isVerified: data.isVerified || false
        })
      }
    } catch (error) {
      console.error('Error fetching credentials:', error)
      toast({
        title: 'Error',
        description: 'Failed to load SmartLead credentials',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!userData?.uid) throw new Error('User not authenticated')

      await setDoc(doc(db, 'smartlead', userData.uid), {
        apiKey: credentials.apiKey,
        apiUrl: credentials.apiUrl,
        isVerified: true,
        updatedAt: new Date()
      })

      toast({
        title: 'Success',
        description: 'SmartLead credentials saved successfully',
      })

      setCredentials(prev => ({ ...prev, isVerified: true }))
      setShowForm(false)
    } catch (error) {
      console.error('Error saving credentials:', error)
      toast({
        title: 'Error',
        description: 'Failed to save SmartLead credentials',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof SmartleadCredentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Please sign in to access this feature</p>
      </div>
    )
  }

  if (!hasSmartLeadAccess(userData?.plan || 'free')) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Pro Feature
        </h2>
        <p className="text-gray-400 mb-4">
          Upgrade to Pro to access SmartLead integration
        </p>
        <Button
          onClick={() => window.location.href = '/portal?tab=billing'}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Upgrade Now
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">SmartLead Integration</h2>
          <p className="text-gray-400 mt-1">Configure your SmartLead connection</p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        {credentials.isVerified ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-green-400">Connected to SmartLead</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">API Key</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={credentials.apiKey}
                  className="bg-gray-900 border-gray-700"
                  disabled
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">API URL</label>
                <Input
                  value={credentials.apiUrl}
                  className="bg-gray-900 border-gray-700"
                  disabled
                />
              </div>
            </div>

            <Button
              onClick={() => window.open('https://app.smartlead.ai', '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open SmartLead Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">API Key</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={credentials.apiKey}
                  onChange={handleInputChange('apiKey')}
                  className="bg-gray-900 border-gray-700 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">API URL</label>
              <Input
                type="url"
                value={credentials.apiUrl}
                onChange={handleInputChange('apiUrl')}
                className="bg-gray-900 border-gray-700"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect SmartLead'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}