"use client"

import { Loader2, LogOut } from "lucide-react"

interface LoadingProps {
  type?: 'loading' | 'logout'
}

export function Loading({ type = 'loading' }: LoadingProps) {
  if (type === 'logout') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <LogOut className="w-12 h-12 text-blue-500" />
          <div className="absolute inset-0 animate-ping bg-blue-500 rounded-full opacity-25" />
        </div>
        <p className="text-sm text-gray-400">Signing you out securely...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      <p className="text-sm text-gray-400">Loading your dashboard...</p>
    </div>
  )
} 