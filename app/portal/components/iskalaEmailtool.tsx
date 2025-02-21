'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Loader2, Mail, Clock, ExternalLink } from 'lucide-react'
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
import ProPlanRestriction from './ProPlanRestriction'

interface SmartleadRequest {
  companyName: string
  email: string
  password: string
  status: 'pending' | 'active' | null  // Changed back to lowercase
  submittedAt: any
  userId?: string
}

const SMARTLEAD_COLLECTION = 'smartlead'
const SMARTLEAD_URL = 'https://www.smartlead.ai/'
const WEBHOOK_URL = 'https://hook.eu2.make.com/xdi76hcmr5tqnfxkdqhc3dtkj0svxgwp'

export default function IskalaEmailTool() {
  const { userData } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestStatus, setRequestStatus] = useState<SmartleadRequest | null>(null)
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    const checkRequestStatus = async () => {
      if (!userData?.uid) return
      
      const docRef = doc(db, SMARTLEAD_COLLECTION, userData.uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        setRequestStatus(docSnap.data() as SmartleadRequest)
      }
    }

    checkRequestStatus()
  }, [userData?.uid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!userData?.uid) throw new Error('User not authenticated')

      const requestData: SmartleadRequest = {
        ...formData,
        status: 'pending',
        submittedAt: serverTimestamp(),
        userId: userData.uid
      }

      // Save to Firestore
      await setDoc(doc(db, SMARTLEAD_COLLECTION, userData.uid), requestData)

      // Prepare webhook payload
      const webhookPayload = {
        userId: userData.uid,
        companyName: formData.companyName,
        email: formData.email,
        password: formData.password.toString(), // Convert to string explicitly
        status: 'pending',
        submittedAt: new Date().toISOString(), // Convert timestamp to ISO string
        userEmail: userData.email,
        userName: userData.basicInfo?.name || '',
        plan: userData.plan || 'free'
      }

      // Send to webhook
      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookPayload)
      })

      if (!webhookResponse.ok) {
        throw new Error('Webhook request failed')
      }

      setRequestStatus(requestData)
      toast({
        title: "Request submitted successfully",
        description: "We'll review your request and get back to you soon.",
      })
    } catch (error) {
      console.error('Error submitting request:', error)
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderContent = () => {
    if (!userData?.plan || userData.plan !== 'pro') {
      return <ProPlanRestriction />
    }

    if (requestStatus?.status === 'active') {
      return (
        <div className="text-center space-y-6 p-8">
          <div className="bg-green-500/10 p-4 rounded-full w-16 h-16 mx-auto">
            <Shield className="w-8 h-8 text-green-500 mx-auto mt-2" />
          </div>
          <h2 className="text-2xl font-bold text-white">Your SmartLead Account is Active</h2>
          <p className="text-gray-400">Click below to access your SmartLead dashboard</p>
          <div className="bg-blue-500/10 rounded-lg p-4 text-sm text-blue-300 mb-4">
            <p>Lost your credentials? Check your confirmation email or contact our support team.</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => window.open(SMARTLEAD_URL, '_blank')}
          >
            Access SmartLead
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )
    }

    if (requestStatus?.status === 'pending') {
      return (
        <div className="text-center space-y-6 p-8">
          <div className="bg-yellow-500/10 p-4 rounded-full w-16 h-16 mx-auto">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mt-2" />
          </div>
          <h2 className="text-2xl font-bold text-white">Request Pending</h2>
          <p className="text-gray-400">
            Your SmartLead account request is being processed. Please check your email for confirmation.
          </p>
          <div className="bg-yellow-500/10 rounded-lg p-4 text-sm text-yellow-300">
            <p>Please check your email {userData?.basicInfo?.email} for the confirmation details.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Request SmartLead Access</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields */}
          <div>
            <label className="text-sm font-medium text-gray-200">Company Name</label>
            <Input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-200">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-200">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              className="mt-1"
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