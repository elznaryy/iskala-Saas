'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Sparkles, Loader2, AlertCircle, PlusCircle, Shield } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { db } from '@/lib/firebase/config'
import { 
  doc, 
  getDoc, 
  updateDoc, 
  increment,
  serverTimestamp 
} from 'firebase/firestore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { PlanType, PLAN_LIMITS } from '@/types/subscription'
import { format } from 'date-fns'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface UsageData {
  count: number
  lastResetDate: Date
}

interface FirestoreUsageData {
  count: number
  lastResetDate: any  // Firestore Timestamp
}

const FLOWISE_API_URL = "https://iskala.app.flowiseai.com/api/v1/prediction/73f6495e-b399-4898-93d0-a2ae9b01ca83"

const getRemainingEmails = (currentUsage: number, plan: PlanType): number => {
  const limit = PLAN_LIMITS[plan].aiEmailLimit
  return limit === Number.MAX_SAFE_INTEGER ? -1 : limit - currentUsage
}

export default function AiEmail() {
  const { userData, loading: userLoading } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [isLoadingUsage, setIsLoadingUsage] = useState(true)
  const [showNewChatConfirm, setShowNewChatConfirm] = useState(false)
  const [showChatStarter, setShowChatStarter] = useState(true)

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!userData?.uid) return
      
      try {
        const usageRef = doc(db, 'usage', userData.uid)
        const usageDoc = await getDoc(usageRef)
        
        if (usageDoc.exists()) {
          setUsageData({
            count: usageDoc.data().aiEmailCount || 0,
            lastResetDate: usageDoc.data().lastResetDate?.toDate() || new Date()
          })
        } else {
          await updateDoc(usageRef, {
            aiEmailCount: 0,
            lastResetDate: serverTimestamp()
          })
          setUsageData({
            count: 0,
            lastResetDate: new Date()
          })
        }
      } catch (error) {
        console.error('Error fetching usage data:', error)
      } finally {
        setIsLoadingUsage(false)
      }
    }

    fetchUsageData()
  }, [userData?.uid])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const startNewChat = () => {
    setMessages([])
    setInput('')
    setShowIntro(false)
    setShowChatStarter(true)
  }

  const handleNewChat = () => {
    if (messages.length > 0) {
      setShowNewChatConfirm(true)
    } else {
      startNewChat()
    }
  }

  const handleEmailStrategy = () => {
    setMessages([])
    setShowIntro(false)
    setShowChatStarter(false)
    sendMessage("Generate email strategy")
  }

  const incrementUsage = async () => {
    if (!userData?.uid) return
    
    try {
      const usageRef = doc(db, 'usage', userData.uid)
      
      await updateDoc(usageRef, {
        aiEmailCount: increment(1),
        updatedAt: serverTimestamp()
      })

      setUsageData(prev => prev ? {
        ...prev,
        count: prev.count + 1
      } : null)

    } catch (error) {
      console.error('Error updating usage:', error)
      toast({
        title: 'Error',
        description: 'Failed to update usage count',
        variant: 'destructive'
      })
    }
  }

  const sendMessage = async (message = input) => {
    if (!input.trim() || isLoading) return

    if (usageData && userData) {
      const limit = PLAN_LIMITS[userData.plan].aiEmailLimit
      if (usageData.count >= limit && limit !== Number.MAX_SAFE_INTEGER) {
        toast({
          title: 'Usage Limit Reached',
          description: 'You have reached your monthly limit. Please upgrade to continue.',
          variant: 'destructive'
        })
        return
      }
    }

    setIsLoading(true)
    const userMessage = input.trim()
    setInput('')
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch(FLOWISE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
      
      await incrementUsage()

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    await sendMessage()
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

  const remainingEmails = getRemainingEmails(usageData?.count || 0, userData.plan)
  const hasReachedLimit = remainingEmails === 0

  if (hasReachedLimit) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Monthly Limit Reached
        </h2>
        <p className="text-gray-400 mb-4">
          You've used all your {PLAN_LIMITS[userData.plan].aiEmailLimit} AI emails for this month.
          {userData.plan === 'free' && " Upgrade to Pro for unlimited emails!"}
        </p>
        {userData.plan === 'free' && (
          <Button
            onClick={() => window.location.href = '/portal?tab=billing'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Upgrade to Pro
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">AI Email Generator</h1>
            <Button 
              onClick={handleNewChat}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Monthly Usage</span>
            <span className="text-sm text-gray-400">
              Plan: {userData.plan.toUpperCase()}
            </span>
          </div>
          {isLoadingUsage ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {usageData?.count || 0} / {
                  PLAN_LIMITS[userData.plan].aiEmailLimit === Number.MAX_SAFE_INTEGER 
                    ? 'Unlimited' 
                    : PLAN_LIMITS[userData.plan].aiEmailLimit
                } emails used
              </span>
              {userData.plan === 'free' && (
                <Button
                  onClick={() => window.location.href = '/portal?tab=billing'}
                  variant="outline"
                  size="sm"
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden border border-gray-700">
        <div className="p-4 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
          <h2 className="text-xl font-semibold text-blue-400">
            AI Strategy Assistant
          </h2>
        </div>
        
        <div ref={chatContainerRef} className="h-[50vh] overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {showChatStarter && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
              >
                <div className="text-center space-y-8 max-w-xl p-8 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div>
                    <Bot className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Hi! I'm your AI Email Assistant
                    </h3>
                    <p className="text-gray-400">
                      Let me help you create effective email strategies
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button
                      onClick={handleEmailStrategy}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 h-auto flex flex-col items-center gap-2"
                    >
                      <Sparkles className="w-6 h-6" />
                      <span className="text-lg">Generate Email Strategy</span>
                      <span className="text-sm text-blue-200">Get strategic email marketing advice</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <div className="flex items-start">
                  {message.role === 'assistant' ? 
                    <Bot className="w-5 h-5 mr-2 mt-1 text-blue-400" /> : 
                    <User className="w-5 h-5 mr-2 mt-1" />
                  }
                  <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-700">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  <p className="text-sm text-gray-300">AI is thinking...</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 bg-gray-900/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-grow bg-gray-800 text-white border-gray-700 focus:border-blue-500"
            />
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </span>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </div>

      <Dialog open={showNewChatConfirm} onOpenChange={setShowNewChatConfirm}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Start New Chat?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300">
              Starting a new chat will clear your current conversation. Do you want to continue?
            </p>
          </div>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowNewChatConfirm(false)}
              className="bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowNewChatConfirm(false)
                startNewChat()
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start New Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}