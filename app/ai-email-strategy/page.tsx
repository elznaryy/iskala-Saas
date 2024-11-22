'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios, { } from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Mail, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  content: string
  role: string
  debugValues?: any
}

export default function AIStrategy() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showIntro, setShowIntro] = useState(true)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)

  const API_KEY = "01d0267e-7565-4272-9e6f-c827f3562b18"
  const ASSISTANT_ID = "758ea4bf-df5a-423f-8f7c-f62e634fa0f2"

  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (mounted && !sessionId) {
        await initializeSession()
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    console.log('Current messages:', messages)
    console.log('Current session ID:', sessionId)
  }, [messages, sessionId])

  const initializeSession = async () => {
    if (sessionId) {
      console.log('Session already exists:', sessionId)
      return true
    }

    try {
      console.log('🚀 Initializing new session...')
      const chatSession = await axios.post(
        'https://agentivehub.com/api/chat/session',
        {
          api_key: API_KEY,
          assistant_id: ASSISTANT_ID,
        }
      )
      
      console.log('📥 Session response:', chatSession.data)
      
      if (chatSession.data.session_id) {
        setSessionId(chatSession.data.session_id)
        console.log('✅ Session ID set:', chatSession.data.session_id)
        return true
      }
      console.error('❌ No session ID in response')
      return false
    } catch (error) {
      console.error('❌ Session initialization error:', error)
      return false
    }
  }

  const sendMessage = async (message = input) => {
    if (!sessionId) {
      console.log('No session ID, attempting to initialize...')
      const success = await initializeSession()
      if (!success) return
    }

    const userMessage: Message = { role: 'user', content: message || input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setShowIntro(false)

    try {
      const chatResponse = {
        api_key: API_KEY,
        session_id: sessionId,
        type: 'custom_code',
        assistant_id: ASSISTANT_ID,
        messages: [{
          role: 'user',
          content: message || input
        }]
      }

      console.log('📤 Sending chat request:', chatResponse)

      const response = await axios.post<ChatResponse>(
        'https://agentivehub.com/api/chat',
        chatResponse
      )

      console.log('📥 Raw response:', response)

      if (response.data && response.data.content) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.content
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        console.error('❌ Invalid response format:', response.data)
        throw new Error('Invalid response format from API')
      }

    } catch (error: unknown) {
      console.error('❌ Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateEmailCopy = () => {
    sendMessage("Generate an email copy for a B2B cold outreach campaign.")
  }

  const presetPrompts = [
    "Create a follow-up email sequence",
    "Generate a sales pitch email",
    "Write a meeting request email",
    "Design an email nurture campaign"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage()
  }

  return (
    <div className="min-h-screen bg-[#000000] bg-gradient-to-br from-black via-gray-900 to-blue-900/30 text-white">
      <header className="absolute top-0 left-0 right-0 z-40 w-full backdrop-blur-md bg-black/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">iSkala</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-10">
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">AI Email Strategy</span>
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  BETA
                </Badge>
              </div>
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link href="/#features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
              <Link href="/#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
              <Link href="/#contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-24">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-400 to-purple-400"
        >
          AI-Powered B2B Email Campaign Strategist
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          Craft compelling B2B email campaigns with our cutting-edge AI assistant. Get started for free!
        </motion.p>

        {/* Preset Prompts */}
        <div className="max-w-4xl mx-auto mb-8 flex flex-wrap gap-4 justify-center">
          {presetPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              className="bg-gray-800/50 hover:bg-gray-700/50 border-gray-700"
              onClick={() => sendMessage(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden border border-gray-700">
          <div className="p-4 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-blue-400">AI Strategy Assistant</h2>
            <Button 
              onClick={handleGenerateEmailCopy}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail className="w-5 h-5 mr-2" />
              Generate Email Copy
            </Button>
          </div>
          
          <div ref={chatContainerRef} className="h-[50vh] overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {showIntro && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center p-6 bg-blue-600/20 rounded-lg"
                >
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                  <h3 className="text-xl font-semibold mb-2">Welcome to Your AI Strategy Assistant!</h3>
                  <p className="text-gray-300">
                    I'm here to help you create powerful B2B email campaigns. Start by asking me to generate an email copy or any other questions about email marketing strategy.
                  </p>
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
                disabled={isLoading || !sessionId} 
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
      </div>
    </div>
  )
}
