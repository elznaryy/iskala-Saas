'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Loader2, Mail, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { db } from '@/lib/firebase/config'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from "@/components/ui/use-toast"
import { hasSmartLeadAccess } from '@/lib/utils/planUtils'

interface SmartleadRequest {
  companyName: string
  email: string
  password: string
  status: 'pending' | 'active'
  submittedAt: any  // Firebase Timestamp
}

const SMARTLEAD_COLLECTION = 'smartlead'

export default function IskalaEmailTool() {
  const { userData } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [requestStatus, setRequestStatus] = useState<SmartleadRequest | null>(null)
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    if (userData?.uid) {
      checkRequestStatus()
    } else {
      setIsLoading(false)
    }
  }, [userData?.uid])

  const checkRequestStatus = async () => {
    try {
      if (!userData?.uid) return

      const docRef = doc(db, SMARTLEAD_COLLECTION, userData.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setRequestStatus(docSnap.data() as SmartleadRequest)
      }
    } catch (error) {
      console.error('Error checking request status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!userData?.uid) throw new Error('User not authenticated')

      // Ensure all required fields are present and valid
      if (!formData.companyName.trim() || !formData.email.trim() || !formData.password.trim()) {
        throw new Error('All fields are required')
      }

      const requestData = {
        companyName: formData.companyName.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        status: 'pending' as const,
        submittedAt: serverTimestamp(),
        userId: userData.uid
      }

      // Save to Firebase
      await setDoc(doc(db, SMARTLEAD_COLLECTION, userData.uid), requestData)

      setRequestStatus({
        ...requestData,
        submittedAt: new Date()
      })
      
      toast({
        title: 'Request Submitted Successfully',
        description: 'Please check your email within 24 hours for your SmartLead account details.',
      })

      setShowForm(false)
    } catch (error) {
      console.error('Error submitting request:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit request',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    
    // Handle both Firestore Timestamp and regular Date objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
          Upgrade to Pro to access SmartLead
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )
    }

    if (requestStatus) {
      return (
        <div className="text-center py-12 space-y-4">
          <Clock className="w-12 h-12 mx-auto text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Request Pending</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Your SmartLead account request is being processed. Please check your email 
            ({requestStatus.email}) within 24 hours for your account details.
          </p>
          <p className="text-sm text-gray-500">
            Submitted on: {formatDate(requestStatus.submittedAt)}
          </p>
        </div>
      )
    }

    return (
      <div className="max-w-md mx-auto py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Request SmartLead Account</h2>
          <p className="text-gray-400">
            Fill in your details to get your SmartLead account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Company Name
            </label>
            <Input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                companyName: e.target.value
              }))}
              className="bg-gray-800 border-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))}
              className="bg-gray-800 border-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                password: e.target.value
              }))}
              className="bg-gray-800 border-gray-700"
              required
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      {renderContent()}
    </div>
  )
}