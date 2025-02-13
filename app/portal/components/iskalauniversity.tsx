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
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { db } from '@/lib/firebase/config'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

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

interface LMSStatus {
  status: 'pending' | 'active'
  email: string
  submittedAt: Date
}

interface LMSFormData {
  firstName: string;
  lastName: string;
  email: string;
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
  videoUrl: 'https://iskala.trainercentralsite.com/#/allcourses',
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

const ZOHO_WEBHOOK_URL = 'https://flow.zoho.com/849281392/flow/webhook/incoming?zapikey=1001.c7d89d205781e040ed31742457138bf8.189c590d02eb4e16d06c3d5d643e7e61&isdebug=false'

// Update the collection name
const LMS_COLLECTION = 'lmsjoin'

export default function IskalaUniversity() {
  const { userData } = useUser()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lmsStatus, setLmsStatus] = useState<LMSStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<LMSFormData>({
    firstName: '',
    lastName: '',
    email: ''
  })

  // Check if user has LMS access based on their plan
  const canAccessLMS = userData?.plan === 'pro'

  // Check existing LMS status
  useEffect(() => {
    const checkLMSStatus = async () => {
      if (!userData?.uid) return

      try {
        const lmsDoc = await getDoc(doc(db, LMS_COLLECTION, userData.uid))
        if (lmsDoc.exists()) {
          setLmsStatus(lmsDoc.data() as LMSStatus)
        }
      } catch (error) {
        console.error('Error checking LMS status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkLMSStatus()
  }, [userData?.uid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!userData?.uid) throw new Error('Not authenticated')

      // Save to Firebase with the correct collection name
      await setDoc(doc(db, LMS_COLLECTION, userData.uid), {
        status: 'pending',
        email: formData.email,
        submittedAt: serverTimestamp(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        userId: userData.uid
      })

      // Call our API route instead of Zoho directly
      const response = await fetch('/api/lms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          userId: userData.uid,
          plan: userData.plan
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit request')
      }

      // Update local state
      setLmsStatus({
        status: 'pending',
        email: formData.email,
        submittedAt: new Date()
      })

      toast({
        title: 'Request Submitted Successfully',
        description: 'Please check your email for LMS access instructions.',
      })

      setShowForm(false)
      setFormData({ firstName: '', lastName: '', email: '' })

    } catch (error) {
      console.error('Error submitting LMS request:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit request',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderLMSButton = () => {
    if (!canAccessLMS) {
      return (
        <Button
          onClick={() => router.push('/portal?tab=billing')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Upgrade to Join LMS
        </Button>
      )
    }

    if (lmsStatus?.status === 'pending') {
      return (
        <div className="text-right">
          <Button disabled className="bg-yellow-600">
            Request Pending
          </Button>
          <p className="text-sm text-gray-400 mt-2">
            Please check your email ({lmsStatus.email}) for access instructions.
          </p>
        </div>
      )
    }

    if (lmsStatus?.status === 'active') {
      return (
        <div className="text-right">
          <p className="text-sm text-gray-400 mb-2">
            Already have access? Check your email for invitation.
          </p>
          <Button
            variant="outline"
            onClick={() => toast({
              title: 'Need Help?',
              description: 'Please contact customer support if you need assistance.',
            })}
          >
            Contact Support
          </Button>
        </div>
      )
    }

    return (
      <Button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Join LMS
      </Button>
    )
  }

  // If user is not on Pro plan, show upgrade message
  if (!canAccessLMS) {
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
          onClick={() => router.push('/portal?tab=billing')}
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            iSkala University
          </h2>
          <p className="text-gray-400">
            Master the art of cold emailing with our comprehensive courses
          </p>
        </div>
        {renderLMSButton()}
      </div>

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

      {/* LMS Join Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join iSkala University LMS</DialogTitle>
            <DialogDescription>
              Fill in your details to get access to our learning platform.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  firstName: e.target.value
                }))}
                placeholder="Enter your first name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  lastName: e.target.value
                }))}
                placeholder="Enter your last name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                placeholder="Enter your email"
                required
              />
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
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
