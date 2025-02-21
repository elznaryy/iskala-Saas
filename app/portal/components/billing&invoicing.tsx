'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { useUser } from '@/contexts/UserContext'
import { Check, Mail, Crown } from 'lucide-react'
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

const PLANS = {
  free: {
    name: 'Free Plan',
    price: 0,
    features: [
      `${PLAN_LIMITS.free.aiEmailLimit} AI emails per month`,
      'Basic email templates',
      'Community support',
    ]
  },
  pro: {
    name: 'Pro Plan',
    price: 100,
    features: [
      `${PLAN_LIMITS.pro.aiEmailLimit} AI emails per month`,
      'Advanced email templates',
      'Priority support',
      'Recorded Masterclass on end-to-end frameworks',
      'Free SmartLead demo account',
      'Middle East database (100K e-commerce stores)',
      'Middle East database (All funded businesses directory)',
      'Exclusive community access',
      'AI-powered cold email copy generator',
      'All campaign templates ',
      'Weekly expert sessions',
      '2,000 customized prospects list tailored to your ICP'
    ]
  }
}

export default function BillingAndInvoicing() {
  const { userData } = useUser()
  const [showContactDialog, setShowContactDialog] = useState(false)
  
  const currentPlan = userData?.plan || 'free'

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
          <div className={`${currentPlan === 'free' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-900/30 border-gray-800'} rounded-lg p-6 border relative`}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Free Plan</h2>
                <p className="text-3xl font-bold text-white">
                  ${PLANS.free.price}
                  <span className="text-sm font-normal text-gray-400">/month</span>
                </p>
              </div>
              
              <ul className="space-y-3">
                {PLANS.free.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              {currentPlan === 'free' ? (
                <Button
                  className="w-full bg-gray-700 hover:bg-gray-600"
                  disabled
                >
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="w-full bg-gray-700 hover:bg-gray-600"
                  onClick={handleContactSupport}
                >
                  Downgrade to Free
                </Button>
              )}
            </div>
          </div>

          {/* Pro Plan Card */}
          <div className={`${currentPlan === 'pro' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-900/10 border-blue-500/20'} rounded-lg p-6 border relative`}>
            {currentPlan === 'pro' && (
              <div className="absolute -top-3 -right-3">
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <Crown className="w-3 h-3 mr-1" />
                  Current
                </span>
              </div>
            )}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Pro Plan</h2>
                <p className="text-3xl font-bold text-white">
                  ${PLANS.pro.price}
                  <span className="text-sm font-normal text-gray-400">/month</span>
                </p>
              </div>
              
              <ul className="space-y-3">
                {PLANS.pro.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 mr-2 text-blue-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              {currentPlan === 'pro' ? (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled
                >
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleUpgradeClick}
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Contact Support Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upgrade to Pro Plan</DialogTitle>
              <DialogDescription>
                Ready to upgrade to Pro? Contact our support team to get started. The Pro plan is ${PLANS.pro.price}/month.
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
