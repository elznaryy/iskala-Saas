'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { signIn, signOut } from '@/lib/firebase/auth'
import { getUserData } from '@/lib/firebase/db'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface FormData {
  email: string
  password: string
}

export default function LoginForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      router.replace('/portal')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { user: authUser, error: signInError } = await signIn(formData.email, formData.password)
      
      if (signInError) {
        let errorMessage = 'Invalid email or password'
        
        switch (signInError.code) {
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            errorMessage = 'Invalid email or password'
            break
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format'
            break
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please try again later'
            break
          default:
            errorMessage = 'An error occurred during login'
        }
        
        setError(errorMessage)
        toast.error(errorMessage)
        return
      }

      if (!authUser) {
        throw new Error('Authentication failed')
      }

      const { data: userData, error: dbError } = await getUserData(authUser.uid)

      if (!userData || dbError) {
        await signOut()
        setError('Account not found. Please sign up or contact support.')
        toast.error('Account not found')
        return
      }

      if (!userData.basicInfo || !userData.plan) {
        await signOut()
        setError('Account setup incomplete. Please sign up again.')
        toast.error('Account setup incomplete')
        return
      }

      toast.success('Login successful!')
      
      router.push('/portal')
      setTimeout(() => {
        window.location.href = '/portal'
      }, 100)

    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = 'Invalid email or password'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  return (
    <div className="min-h-screen bg-[#000000] bg-gradient-to-br from-black via-gray-900 to-blue-900/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-sm p-8 rounded-xl"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          className="text-gray-400 hover:text-white flex items-center"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
                required
              />
            </div>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⚪</span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}