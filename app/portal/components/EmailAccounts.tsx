'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Mail as GmailIcon, Mail as OutlookIcon, Mail as SmtpIcon, History, Clock, CheckCircle, Loader2, Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/app/portal/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { toast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUser } from '@/contexts/UserContext'
import { db } from '@/lib/firebase/config'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
  QuerySnapshot,
  DocumentData,
  setDoc
} from 'firebase/firestore'
import { EmailRequest } from '@/types/emailRequests'

interface Provider {
  name: string
  poweredBy: string
  icon: React.ReactNode
  href: string
}

const providers: Provider[] = [
  {
    name: 'Google Provider',
    poweredBy: 'Powered by InboxAutomate',
    icon: <GmailIcon className="w-8 h-8 text-blue-400" />,
    href: 'https://google-provider-url.com'
  },
  {
    name: 'Outlook Provider',
    poweredBy: 'Powered by Infrainbox',
    icon: <OutlookIcon className="w-8 h-8 text-blue-400" />,
    href: 'https://outlook-provider-url.com'
  },
  {
    name: 'SMTP Provider',
    poweredBy: 'Powered by Mailreef',
    icon: <SmtpIcon className="w-8 h-8 text-blue-400" />,
    href: 'https://smtp-provider-url.com'
  }
]

const isFirebaseError = (error: any): error is { code: string; message: string } => {
  return error && typeof error.code === 'string' && typeof error.message === 'string'
}

// Add interface for form data at the top of the file
interface EmailFormData {
  provider: 'google' | 'outlook' | 'smtp' | '';
  numberOfAccounts: number;
  names: string;
  profilePhotoUrl: string;
  domainProviderLink: string;
  domains: string;
}

export default function EmailAccounts() {
  const { userData } = useUser()
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requests, setRequests] = useState<EmailRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<EmailFormData>({
    provider: '',
    numberOfAccounts: 1,
    names: '',
    profilePhotoUrl: '',
    domainProviderLink: '',
    domains: ''
  })
  const [editingRequest, setEditingRequest] = useState<EmailRequest | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch requests when component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      if (!userData?.uid) return
      
      try {
        setIsLoading(true)
        
        const requestsRef = collection(db, 'emailRequests')
        const q = query(
          requestsRef,
          where('userId', '==', userData.uid),
          orderBy('createdAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        const fetchedRequests: EmailRequest[] = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            userId: data.userId,
            email: data.email,
            provider: data.provider as 'google' | 'outlook' | 'smtp',
            numberOfAccounts: data.numberOfAccounts,
            names: data.names,
            profilePhotoUrl: data.profilePhotoUrl,
            domainProviderLink: data.domainProviderLink,
            domains: data.domains,
            status: data.status as 'pending' | 'active' | 'rejected',
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          }
        })

        setRequests(fetchedRequests)
      } catch (error) {
        console.error('Error fetching requests:', error)
        toast({
          title: 'Error',
          description: 'Failed to load email requests. Please try again.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [userData?.uid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!userData?.uid) throw new Error('User not authenticated')
      if (!formData.provider) throw new Error('Provider is required')
      if (!formData.names) throw new Error('Names are required')
      if (!formData.domains) throw new Error('Domains are required')
      if (formData.numberOfAccounts < 1) throw new Error('Number of accounts must be at least 1')

      // Create a new request object with all the form data
      const newRequest = {
        userId: userData.uid,
        provider: formData.provider,
        numberOfAccounts: formData.numberOfAccounts,
        names: formData.names.trim(),
        profilePhotoUrl: formData.profilePhotoUrl.trim() || '',
        domainProviderLink: formData.domainProviderLink.trim() || '',
        domains: formData.domains.trim() || '',
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      // Add the document to the emailRequests collection
      const docRef = await addDoc(collection(db, 'emailRequests'), newRequest)

      // Update local state with the new request
      const newEmailRequest: EmailRequest = {
        id: docRef.id,
        ...newRequest,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setRequests(prev => [newEmailRequest, ...prev])
      setShowRequestForm(false)
      
      // Reset form
      setFormData({
        provider: '',
        numberOfAccounts: 1,
        names: '',
        profilePhotoUrl: '',
        domainProviderLink: '',
        domains: ''
      })

      toast({
        title: 'Request Submitted',
        description: 'We will process your request shortly.',
      })
    } catch (error) {
      console.error('Error submitting request:', error)
      toast({
        title: 'Error',
        description: isFirebaseError(error) 
          ? `Failed to submit request: ${error.message}`
          : 'Failed to submit request. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (request: EmailRequest) => {
    setEditingRequest(request)
    setFormData({
      provider: request.provider,
      numberOfAccounts: request.numberOfAccounts,
      names: request.names,
      profilePhotoUrl: request.profilePhotoUrl,
      domainProviderLink: request.domainProviderLink,
      domains: request.domains
    })
    setShowRequestForm(true)
  }

  const handleDelete = async (requestId: string) => {
    if (!userData?.uid) return

    try {
      const requestRef = doc(db, 'emailRequests', requestId)
      await deleteDoc(requestRef)
      setRequests(prev => prev.filter(req => req.id !== requestId))
      
      toast({
        title: "Request Deleted",
        description: "Your request has been successfully deleted.",
      })
    } catch (error) {
      console.error('Error deleting request:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete request. Please try again.',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-12">
      {/* Do It Yourself Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Do It Yourself
          </h2>
          <p className="text-gray-400">
            Set up your email infrastructure manually with our trusted providers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider, index) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link 
                href={provider.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 
                         hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 relative flex items-center justify-center">
                    {provider.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {provider.poweredBy}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Done For You Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Done For You
          </h2>
          <p className="text-gray-400">
            Let us handle the setup and configuration of your email infrastructure
          </p>
        </div>

        <div className="space-y-6">
          {/* Request Button */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowRequestForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Request Email Accounts
              </Button>
            </div>
          </div>

          {/* Processing Time Notice */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              Your request could take up to 24 hours to process. Please check your email for updates and payment instructions.
            </p>
          </div>

          {/* Request History */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">
              Requests History
            </h3>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : requests.length > 0 ? (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 group relative hover:border-gray-600 transition-colors"
                  >
                    {/* Request details */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-white mb-1">
                          {request.names || 'No name provided'}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {request.numberOfAccounts} account(s) requested
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm flex items-center ${
                          request.status === 'pending' 
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : request.status === 'active'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {request.status === 'pending' ? (
                            <Clock className="w-4 h-4 mr-1" />
                          ) : request.status === 'active' ? (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          ) : (
                            <span className="w-4 h-4 mr-1">×</span>
                          )}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>

                        {request.status === 'pending' && (
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(request)}
                              className="hover:bg-blue-500/10"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(request.id)}
                              className="hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional details */}
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Requested on: {request.createdAt.toLocaleDateString()}</p>
                      {request.domainProviderLink && (
                        <p>Domain Provider: {request.domainProviderLink}</p>
                      )}
                      {request.domains && <p>Domains: {request.domains}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No requests found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Form Dialog */}
      <Dialog open={showRequestForm} onOpenChange={(open) => {
        setShowRequestForm(open)
        if (!open) {
          setEditingRequest(null)
          setFormData({
            provider: '',
            numberOfAccounts: 1,
            names: '',
            profilePhotoUrl: '',
            domainProviderLink: '',
            domains: ''
          })
        }
      }}>
        <DialogContent 
          className="sm:max-w-[425px] bg-gray-900 text-white"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editingRequest ? 'Edit Email Account Request' : 'Request Email Accounts'}
            </DialogTitle>
            <p className="text-sm text-gray-400">
              {editingRequest 
                ? 'Update your email account request details below.'
                : 'Fill in the details below to request new email accounts.'}
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Email Provider</label>
              <Select
                value={formData.provider}
                onValueChange={(value: 'google' | 'outlook' | 'smtp') => 
                  setFormData(prev => ({ ...prev, provider: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Provider</SelectItem>
                  <SelectItem value="outlook">Outlook Provider</SelectItem>
                  <SelectItem value="smtp">SMTP Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Number of Accounts</label>
              <Input
                type="number"
                min="1"
                value={formData.numberOfAccounts}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  setFormData(prev => ({ 
                    ...prev, 
                    numberOfAccounts: isNaN(value) ? 1 : value 
                  }))
                }}
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-xs text-blue-400">It's better to implement 3 email accounts per domain</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">First Name and Last Name (one per line)</label>
              <Textarea
                value={formData.names}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setFormData(prev => ({ ...prev, names: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="John Doe&#10;Jane Smith"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Email Profile Photo URL</label>
              <Input
                type="url"
                value={formData.profilePhotoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, profilePhotoUrl: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Domain Provider Link</label>
              <Input
                type="url"
                value={formData.domainProviderLink}
                onChange={(e) => setFormData(prev => ({ ...prev, domainProviderLink: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="https://domain-provider.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Domain Names (one per line)</label>
              <Textarea
                value={formData.domains}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setFormData(prev => ({ ...prev, domains: e.target.value }))}
                className="bg-gray-800 border-gray-700"
                placeholder="example1.com&#10;example2.com"
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Submit Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}