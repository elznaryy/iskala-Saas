'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Sparkles, Loader2, AlertCircle, PlusCircle, Shield, FileDown } from 'lucide-react'
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
import { Badge } from "@/components/ui/badge"

// First, define the role type
type MessageRole = 'user' | 'assistant'

// Update the Message interface
interface Message {
  role: MessageRole
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
const MAX_MESSAGES = 50

const getRemainingEmails = (currentUsage: number, plan: PlanType): number => {
  const limit = PLAN_LIMITS[plan].aiEmailLimit
  return limit === Number.MAX_SAFE_INTEGER ? -1 : limit - currentUsage
}

const cleanAIResponse = (text: string): string => {
  return text
    // Remove Markdown headers (##, ###, etc)
    .replace(/^#{1,6}\s/gm, '')
    // Remove Markdown bold/italic markers
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Remove Markdown bullet points
    .replace(/^\s*[-*+]\s/gm, '')
    // Remove backticks for code
    .replace(/`/g, '')
    // Remove excessive newlines (more than 2)
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace
    .trim()
}

const getUsageColor = (percentage: number): string => {
  if (percentage >= 90) return 'from-red-500 to-red-600'
  if (percentage >= 70) return 'from-yellow-500 to-orange-500'
  return 'from-green-500 to-emerald-500'
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
    setShowIntro(true)
    setShowChatStarter(true)
    setShowNewChatConfirm(false)
  }

  const handleNewChat = () => {
    if (messages.length > 0) {
      setShowNewChatConfirm(true)
    } else {
      startNewChat()
    }
  }

  const handleEmailStrategy = async () => {
    const strategyPrompt = "I need to generate email strategy. Please help me create effective email copy that converts."
    
    setMessages([])
    setShowChatStarter(false)
    
    const newUserMessage: Message = {
      role: 'user' as MessageRole,
      content: strategyPrompt
    }
    
    setMessages([newUserMessage])
    
    const response = await sendMessage(strategyPrompt)
    
    if (response) {
      const assistantMessage: Message = {
        role: 'assistant' as MessageRole,
        content: response
      }
      setMessages(messages => [...messages, assistantMessage])
      await incrementUsage()
    }
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

  const sendMessage = async (message: string): Promise<string | null> => {
    try {
      setIsLoading(true)
      
      const response = await fetch(FLOWISE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          question: message,
          history: messages.map((m: Message) => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const rawResponse = data.text || data.response

      // Validate and clean the response
      if (typeof rawResponse !== 'string') {
        console.error('Invalid response format:', rawResponse)
        throw new Error('Invalid response format from AI service')
      }

      // Clean the response before returning
      const cleanedResponse = cleanAIResponse(rawResponse)

      // Validate the cleaned response
      if (!cleanedResponse) {
        throw new Error('Empty response from AI service')
      }

      return cleanedResponse
    } catch (error) {
      console.error('AI Service Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate response. Please try again.",
        variant: "destructive"
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setInput('')

    const newUserMessage: Message = {
      role: 'user' as MessageRole,
      content: userMessage
    }

    setMessages(messages => [...messages, newUserMessage])

    try {
      const response = await sendMessage(userMessage)
      
      if (response) {
        const assistantMessage: Message = {
          role: 'assistant' as MessageRole,
          content: response
        }
        
        setMessages(messages => [...messages, assistantMessage])
        await incrementUsage()
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      })
    }
  }

  const exportChat = () => {
    if (messages.length === 0) {
      toast({
        title: 'Nothing to Export',
        description: 'Start a conversation first before exporting.',
        variant: 'default'
      })
      return
    }

    try {
      const formattedChat = messages.map(msg => 
        `${msg.role.toUpperCase()}: ${msg.content}`
      ).join('\n\n')

      const timestamp = new Date().toISOString().split('T')[0]
      const fileName = `email-conversation-${timestamp}.txt`

      const blob = new Blob([formattedChat], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Conversation Exported',
        description: 'Your chat has been saved successfully.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export conversation.',
        variant: 'destructive'
      })
    }
  }

  // Add keydown handler for the input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter: add new line
        e.preventDefault()
        setInput(prev => prev + '\n')
      } else {
        // Just Enter: submit form
        e.preventDefault()
        handleSubmit(e)
      }
    }
  }

  // Add auto-resize effect for the textarea
  useEffect(() => {
    const textarea = document.querySelector('textarea')
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }, [input])

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">AI Email Generator</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700">
              {messages.length}/{MAX_MESSAGES} messages
            </span>
            {messages.length > 0 && (
              <Button
                onClick={exportChat}
                variant="outline"
                size="sm"
                className="border-gray-700 hover:bg-gray-800 gap-2"
              >
                <FileDown className="w-4 h-4" />
                Export Chat
              </Button>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-700/50 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-gray-200 font-medium">Usage Status</span>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              {userData.plan.toUpperCase()}
            </Badge>
          </div>
          
          {isLoadingUsage ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Usage Tube */}
              <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                <>
                  {/* Background segments */}
                  <div className="absolute inset-0 flex">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 border-r border-gray-700/30 last:border-0"
                      />
                    ))}
                  </div>
                  
                  {/* Fill bar */}
                  <div 
                    className={`absolute h-full bg-gradient-to-r ${
                      getUsageColor(
                        (usageData?.count || 0) / PLAN_LIMITS[userData.plan].aiEmailLimit * 100
                      )
                    } transition-all duration-500 ease-out`}
                    style={{ 
                      width: `${Math.min(
                        ((usageData?.count || 0) / PLAN_LIMITS[userData.plan].aiEmailLimit) * 100, 
                        100
                      )}%` 
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                  </div>
                </>
              </div>

              {/* Usage Info */}
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-400">
                    {`${usageData?.count || 0} / ${PLAN_LIMITS[userData.plan].aiEmailLimit} emails used`}
                  </p>
                </div>
                
                {userData.plan === 'free' && (
                  <Button
                    onClick={() => window.location.href = '/portal?tab=billing'}
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700/50">
        <div className="p-4 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-medium text-gray-200">AI Strategy Assistant</h2>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border-purple-700/50 hover:bg-purple-700/30 hover:text-purple-200 transition-all duration-200 gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                New Chat
              </Button>
              {messages.length > 0 && (
                <Button
                  onClick={exportChat}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 border-blue-700/50 hover:bg-blue-700/30 hover:text-blue-200 transition-all duration-200 gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Export Chat
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div ref={chatContainerRef} className="h-[60vh] overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center items-center min-h-[400px]"
            >
              <div className="text-center space-y-8 max-w-xl p-8 rounded-lg bg-gradient-to-b from-gray-800/30 to-gray-900/30 border border-gray-700/50">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    Welcome to AI Email Assistant
                  </h3>
                  <p className="text-gray-400 text-lg">
                    Let's create compelling email strategies together
                  </p>
                </div>
                
                <Button
                  onClick={handleEmailStrategy}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 h-auto flex flex-col items-center gap-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <Sparkles className="w-6 h-6" />
                  <span className="text-lg font-medium">Generate Email Copy</span>
                  <span className="text-sm text-blue-200 opacity-90">Get AI-powered email strategies</span>
                </Button>
              </div>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div 
                className={`flex items-start space-x-4 max-w-[80%] ${
                  message.role === 'assistant' 
                    ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-700/50' 
                    : 'bg-gradient-to-r from-blue-600/20 to-blue-500/20'
                } p-4 rounded-lg`}
              >
                <div className={`p-2 rounded-lg ${
                  message.role === 'assistant' 
                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20' 
                    : 'bg-blue-500/20'
                }`}>
                  {message.role === 'assistant' ? (
                    <Bot className="w-5 h-5 text-purple-400" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className={`text-sm font-medium ${
                    message.role === 'assistant' ? 'text-purple-300' : 'text-gray-200'
                  }`}>
                    {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                  </p>
                  <p className={`whitespace-pre-wrap ${
                    message.role === 'user' ? 'text-white' : 'text-purple-100'
                  }`}>
                    {message.content}
                  </p>
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
              <div className="max-w-[80%] p-3 rounded-lg bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700/30">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  <p className="text-sm text-purple-300">AI is thinking...</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-[50px] w-[50px] rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6 transform rotate-180" />
              )}
            </Button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift + Enter for new line)"
              className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[50px] max-h-[120px] resize-y text-sm text-right"
              dir="rtl"
              rows={1}
              style={{
                overflow: 'hidden',
                resize: 'none',
                height: 'auto'
              }}
            />
          </form>
        </div>
      </div>

      <Dialog open={showNewChatConfirm} onOpenChange={setShowNewChatConfirm}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Start New Chat?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300 mb-4">
              This will clear your current conversation. Are you sure you want to start a new chat?
            </p>
            <div className="flex flex-col space-y-2">
              <Button
                onClick={exportChat}
                className="bg-gray-800 hover:bg-gray-700 text-white"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export Conversation
              </Button>
            </div>
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
                startNewChat()
                setShowNewChatConfirm(false)
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