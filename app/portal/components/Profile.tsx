'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@/contexts/UserContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react'
import { db } from '@/lib/firebase/config'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function Profile() {
  const { userData, refreshUserData } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    companyName: ''
  })

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.basicInfo?.name || '',
        email: userData.basicInfo?.email || '',
        phoneNumber: userData.basicInfo?.phoneNumber || '',
        companyName: userData.basicInfo?.companyName || ''
      })
    }
  }, [userData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!userData?.uid) throw new Error('User not authenticated')

      const userRef = doc(db, 'users', userData.uid)
      await updateDoc(userRef, {
        'basicInfo.name': formData.name,
        'basicInfo.email': formData.email,
        'basicInfo.phoneNumber': formData.phoneNumber,
        'basicInfo.companyName': formData.companyName,
        updatedAt: serverTimestamp()
      })

      await refreshUserData()
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Phone Number</label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Company Name</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="bg-gray-800 border-gray-700"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Plan</label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={userData?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    className="bg-gray-800 border-gray-700"
                    disabled
                  />
                  {userData?.plan === 'pro' && (
                    <Badge variant="default" className="bg-blue-600">
                      Pro
                    </Badge>
                  )}
                </div>
                {userData?.plan === 'free' && (
                  <p className="text-xs text-gray-400 mt-1">
                    Upgrade to Pro for full access to all features
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </div>
          </form>
        </div>

        {userData?.plan === 'free' && (
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-2">
              Upgrade to Pro
            </h2>
            <p className="text-gray-400 mb-4">
              Get access to all premium features and unlimited usage.
            </p>
            <Button
              onClick={() => window.location.href = '/portal?tab=billing'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Upgrade Now
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
} 