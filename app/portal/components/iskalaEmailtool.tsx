'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  ExternalLink, 
  Key, 
  Mail, 
  MessageSquare, 
  Shield, 
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useUser } from '@/contexts/UserContext'
import ProPlanRestriction from './ProPlanRestriction'

export default function IskalaEmailTool() {
  const { userData } = useUser()

  // Check if user has access based on their plan
  if (!userData?.plan || userData.plan !== 'pro') {
    return <ProPlanRestriction />
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header Section */}
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          SmartLead Access
        </h1>
        <p className="text-gray-400">
          Access your SmartLead demo account and explore powerful email automation features.
        </p>
      </div>

      {/* Demo Credentials Card */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-400" />
              Demo Credentials
            </CardTitle>
            <CardDescription>
              Use these credentials to access SmartLead
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Username</span>
                </div>
                <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">
                  Demo@iskala.net
                </code>
              </div>
              <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Password</span>
                </div>
                <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">
                  Demo@123
                </code>
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => window.open('https://app.smartlead.ai/', '_blank')}
            >
              Access SmartLead
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Support & Help Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              Need Help?
            </CardTitle>
            <CardDescription>
              Our support team is here to assist you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-1" />
                <p className="text-sm text-gray-300">
                  If you experience any issues with the demo account or have questions, 
                  please don't hesitate to contact our support team.
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full bg-gray-700 hover:bg-gray-600"
              onClick={() => {
                if (typeof window !== 'undefined' && window.$zoho?.salesiq) {
                  window.$zoho.salesiq.floatwindow.visible('show')
                }
              }}
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sign Up Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl p-8 border border-blue-500/20"
      >
        <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-white">
          <Sparkles className="h-6 w-6 text-blue-400" />
          Get Your Own Account
        </div>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Ready to take your email outreach to the next level? Sign up for your own SmartLead account today.
        </p>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          onClick={() => window.open('https://www.smartlead.ai/?via=ehab', '_blank')}
        >
          Sign Up for SmartLead
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  )
}