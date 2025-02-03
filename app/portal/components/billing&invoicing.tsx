'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { useUser } from '@/contexts/UserContext'
import { Check, Mail } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { PLAN_LIMITS } from '@/types/subscription'
import { toast } from "@/components/ui/use-toast"

export default function BillingAndInvoicing() {
  const { userData } = useUser()
  const [showContactDialog, setShowContactDialog] = useState(false)

  const features = {
    free: [
      `${PLAN_LIMITS.free.aiEmailLimit} AI emails per month`,
      'Basic email templates',
      'Community support',
    ],
    pro: [
      `${PLAN_LIMITS.pro.aiEmailLimit} AI emails per month`,
      'Advanced email templates',
      'Priority support',
      'SmartLead integration',
      'Advanced analytics',
      'Custom features'
    ]
  }

  const handleUpgradeClick = () => {
    setShowContactDialog(true)
  }

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@iskala.app?subject=Pro Plan Upgrade Request'
    toast({
      title: "Email Client Opened",
      description: "Please send us your upgrade request and we'll get back to you shortly.",
    })
    setShowContactDialog(false)
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Plans & Billing</h1>
          <p className="text-gray-400 mt-2">Choose the right plan for your needs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan Card */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-2">Free Plan</h2>
            <p className="text-3xl font-bold text-white mb-6">$0<span className="text-sm font-normal text-gray-400">/month</span></p>
            
            <ul className="space-y-3 mb-6">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-gray-700 hover:bg-gray-600"
              disabled
            >
              Current Plan
            </Button>
          </div>

          {/* Pro Plan Card */}
          <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-500/30">
            <h2 className="text-xl font-semibold text-white mb-2">Pro Plan</h2>
            <p className="text-3xl font-bold text-white mb-6">Contact Us<span className="text-sm font-normal text-gray-400">/month</span></p>
            
            <ul className="space-y-3 mb-6">
              {features.pro.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 mr-2 text-blue-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleUpgradeClick}
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>

        {/* Contact Support Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact Support for Upgrade</DialogTitle>
              <DialogDescription>
                To upgrade to our Pro plan, please contact our support team. We'll help you with the upgrade process and answer any questions you may have.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-400 mb-4">
                Click the button below to send us an email, or reach out to us at:
                <br />
                <span className="text-blue-400">support@iskala.app</span>
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setShowContactDialog(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleContactSupport}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
