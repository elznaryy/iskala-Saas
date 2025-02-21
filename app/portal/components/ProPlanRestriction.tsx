'use client'

import { Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export default function ProPlanRestriction() {
  const router = useRouter()

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
        onClick={() => router.push('/portal/billing')}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Upgrade Now
      </Button>
    </div>
  )
} 