'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Book, Clock, Award, User, Mail, Lock, ExternalLink, Loader2, Play, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "./ui/dialog"
import { toast } from 'react-hot-toast'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { LMSCredentials } from '@/types/lmsCredentials'
import { hasLMSAccess } from '@/lib/utils/planUtils'
import Image from 'next/image'

interface LearnerCredentials {
  fullName: string
  companyName: string
  email: string
  submittedAt: Date
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

interface PreviewVideo {
  thumbnailUrl: string
  videoUrl: string
  title: string
  duration: string
  description: string
  chapters: {
    time: string
    title: string
  }[]
}

interface UserData {
  uid: string
  email: string | null
  displayName?: string  // Using displayName instead of name
  plan?: string
  subscription?: {
    planId: string
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
}

const previewVideo: PreviewVideo = {
  thumbnailUrl: '/images/course-preview.jpg',
  videoUrl: 'https://your-video-url.com',
  title: 'Master Cold Email Marketing: Complete Course Preview',
  duration: '2:30',
  description: 'Get a sneak peek into our comprehensive cold email marketing course. Learn how to craft compelling emails, improve deliverability, and increase your response rates.',
  chapters: [
    { time: '0:00', title: 'Introduction to Cold Emailing' },
    { time: '0:45', title: 'Understanding Your Audience' },
    { time: '1:15', title: 'Crafting Perfect Subject Lines' },
    { time: '1:45', title: 'Deliverability Best Practices' },
    { time: '2:15', title: 'Measuring Success' }
  ]
}

export default function IskalaUniversity() {
  const { userData } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [existingRequest, setExistingRequest] = useState<any>(null)
  const [credentials, setCredentials] = useState<LearnerCredentials>({
    fullName: '',
    companyName: '',
    email: '',
    submittedAt: new Date()
  })

  // Check if user has LMS access based on their plan
  const canAccessLMS = userData ? hasLMSAccess(userData.plan) : false

  useEffect(() => {
    const checkLMSAccess = async () => {
      if (!userData?.uid) return
      
      try {
        const credentialsRef = doc(db, 'lmsCredentials', userData.uid)
        const credentialsDoc = await getDoc(credentialsRef)
        
        if (credentialsDoc.exists()) {
          // Store existing request data
          setExistingRequest(credentialsDoc.data())
          setShowSignupForm(false)
        }
      } catch (error) {
        console.error('Error checking LMS access:', error)
      } finally {
        setLoading(false)
      }
    }

    checkLMSAccess()
  }, [userData?.uid])

  const getRequestStatus = () => {
    if (!existingRequest) return null

    const submittedAt = existingRequest.submittedAt?.toDate()
    if (!submittedAt) return null

    const hoursSinceSubmission = (new Date().getTime() - submittedAt.getTime()) / (1000 * 60 * 60)
    const hoursRemaining = Math.max(0, 24 - hoursSinceSubmission)

    return {
      status: existingRequest.status,
      hoursRemaining: Math.round(hoursRemaining)
    }
  }

  const renderAccessButton = () => {
    if (loading) {
      return (
        <Button disabled>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading...
        </Button>
      )
    }

    const requestStatus = getRequestStatus()

    if (requestStatus) {
      if (requestStatus.status === 'pending') {
        return (
          <div className="text-right">
            <Button disabled className="bg-yellow-600">
              Request Pending
            </Button>
            <p className="text-sm text-gray-400 mt-2">
              {requestStatus.hoursRemaining > 0 
                ? `Please check your email (${existingRequest.email}). Access will be granted within ${requestStatus.hoursRemaining} hours.`
                : 'Your request is being processed. Please check your email for access instructions.'}
            </p>
          </div>
        )
      }
      if (requestStatus.status === 'active') {
        return (
          <Button 
            onClick={() => window.open('your-lms-url', '_blank')}
            className="bg-green-600 hover:bg-green-700"
          >
            Access LMS
          </Button>
        )
      }
    }

    return (
      <Button
        onClick={() => setShowSignupForm(true)}
        className="bg-blue-600 hover:bg-blue-700"
        disabled={!canAccessLMS}
      >
        {canAccessLMS ? 'Join LMS' : 'Upgrade to Access LMS'}
      </Button>
    )
  }

  const handleSignup = async () => {
    if (!userData?.uid) {
      toast.error('Please sign in to access LMS')
      return
    }

    if (!canAccessLMS) {
      toast.error('Please upgrade your plan to access LMS')
      router.push('/portal?tab=billing')
      return
    }

    try {
      setLoading(true)

      // Validate required fields
      if (!credentials.fullName.trim()) throw new Error('Full name is required')
      if (!credentials.email.trim()) throw new Error('Email is required')
      if (!credentials.companyName.trim()) throw new Error('Company name is required')

      const names = credentials.fullName.trim().split(' ')
      
      const lmsCredentials: LMSCredentials = {
        id: userData.uid,
        userId: userData.uid,
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: credentials.email.trim(),
        companyName: credentials.companyName.trim(),
        submittedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        status: 'pending' as const,
        password: '' // Will be set by the LMS system
      }

      // Use setDoc with merge option to handle updates
      await setDoc(
        doc(db, 'lmsCredentials', userData.uid), 
        lmsCredentials,
        { merge: true }
      )
      
      setExistingRequest(lmsCredentials)
      setShowSignupForm(false)
      
      toast.success('Request submitted successfully! You will receive an email within 24 hours.')
    } catch (error) {
      console.error('Error submitting LMS request:', error)
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to submit request'
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  // Check if user has LMS access
  if (!hasLMSAccess(userData?.plan || 'free')) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Pro Feature
        </h2>
        <p className="text-gray-400 mb-4">
          Upgrade to Pro to access iSkala University LMS
        </p>
        <Button
          onClick={() => window.location.href = '/portal?tab=billing'}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Upgrade Now
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          iSkala University
        </h2>
        <p className="text-gray-400">
          Master the art of cold emailing with our comprehensive courses
        </p>
      </div>

      {/* LMS Access Section */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">LMS Access</h3>
            <p className="text-gray-400">Request access to our learning platform</p>
          </div>
          {renderAccessButton()}
        </div>

        <Dialog open={showSignupForm} onOpenChange={setShowSignupForm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Join iSkala University</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-2">
                Complete this form to request access. You'll receive an invitation email within 24 hours.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSignup()
            }} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <Input
                  type="text"
                  value={credentials.fullName}
                  onChange={(e) => setCredentials(prev => ({
                    ...prev,
                    fullName: e.target.value
                  }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <Input
                  type="text"
                  value={credentials.companyName}
                  onChange={(e) => setCredentials(prev => ({
                    ...prev,
                    companyName: e.target.value
                  }))}
                  placeholder="Enter your company name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <Input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <Button 
                type="submit"
                disabled={loading || !credentials.fullName || !credentials.email || !credentials.companyName}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Preview Video Section */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-2">
              Course Preview
            </h3>
            <p className="text-gray-400">
              Watch our course trailer to see what you'll learn
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 p-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video rounded-lg overflow-hidden group">
                <Image
                  src="/images/courseimage.jpg"
                  alt="Course Preview"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Play Button */}
                <Link 
                  href={previewVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-blue-600/90 flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <motion.div 
                      className="absolute inset-0 w-20 h-20 rounded-full bg-blue-600/50"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                    />
                  </div>
                </Link>

                {/* Video Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-lg font-medium text-white mb-2">
                    {previewVideo.title}
                  </h4>
                  <div className="flex items-center text-sm text-gray-300">
                    <Clock className="w-4 h-4 mr-1" />
                    {previewVideo.duration}
                  </div>
                </div>
              </div>

              {/* Video Description */}
              <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                <p className="text-gray-300">
                  {previewVideo.description}
                </p>
              </div>
            </div>

            {/* Chapters List */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 rounded-lg h-full">
                <div className="p-4 border-b border-gray-700">
                  <h4 className="text-lg font-semibold text-white">
                    Course Chapters
                  </h4>
                </div>
                <div className="p-2">
                  {previewVideo.chapters.map((chapter, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-800/50 transition-colors group cursor-pointer"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-400">
                          {chapter.time}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          {chapter.title}
                        </h5>
                      </div>
                      <Play className="w-4 h-4 text-gray-400 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-900/50">
            <div className="text-center p-4 rounded-lg bg-gray-800/50"> 
              <div className="text-2xl font-bold text-blue-400 mb-1">10+</div>
              <div className="text-sm text-gray-400">Video Lessons</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-800/50">
              <div className="text-2xl font-bold text-blue-400 mb-1">4h</div>
              <div className="text-sm text-gray-400">Total Duration</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-800/50">
              <div className="text-2xl font-bold text-blue-400 mb-1">24/7</div>
              <div className="text-sm text-gray-400">Access</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-800/50">
              <div className="text-2xl font-bold text-blue-400 mb-1">100%</div>
              <div className="text-sm text-gray-400">Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Book className="w-8 h-8" />}
          title="Expert-Led Courses"
          description="Learn from industry professionals with years of experience in B2B sales and email marketing."
        />
        <FeatureCard
          icon={<Clock className="w-8 h-8" />}
          title="10+ Hours of Content"
          description="Access over 10 hours of in-depth learning materials, including video lectures, case studies, and practical exercises."
        />
        <FeatureCard
          icon={<Award className="w-8 h-8" />}
          title="Certification"
          description="Earn an iSkala Cold Email Specialist certification upon completion of the course."
        />
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
      className="bg-gray-800/50 p-6 rounded-lg border border-gray-700"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="text-blue-400 bg-blue-900/20 p-3 rounded-full">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}
