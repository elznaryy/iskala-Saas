'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUser } from '@/contexts/UserContext'
import { 
  Users, 
  Loader2, 
  Mail, 
  Building, 
  MapPin, 
  Briefcase, 
  Factory,
  Link as LinkIcon,
  History,
  HelpCircle,
  Check,
  Download,
  Edit,
  Trash,
  CheckCircle2,
  ArrowRight,
  Crown
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { db } from '@/lib/firebase/config'
import { doc, setDoc, getDoc, getDocs, collection, query, where, orderBy, serverTimestamp, FieldValue, deleteDoc, updateDoc } from 'firebase/firestore'
import { toast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"

interface ProspectRequest {
  id: string
  userId: string
  companyName: string
  email: string
  numberOfProspects: number
  location?: string
  position?: string
  industry?: string
  apolloLink?: string
  status: 'pending' | 'completed' | 'processing'
  submittedAt: Date | null
  requestDate: Date | null
  requestTime: string
  deliveryDate?: Date | null
  deliveryLink?: string
  notes?: string
  processedBy?: string
  processedAt?: Date | null
}

const MONTHLY_CREDIT_LIMIT = 2000

const CreditProgressBar = ({ used, total }: { used: number, total: number }) => {
  const percentage = (used / total) * 100
  const getColor = () => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <div className="mt-6 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-white">Monthly Credit Usage</h3>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">
            {used.toLocaleString()} / {total.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full ${getColor()} rounded-full`}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span className="text-gray-400">Credits reset on the 1st of each month</span>
        <span className="text-gray-400">{(total - used).toLocaleString()} credits remaining</span>
      </div>
    </div>
  )
}

const RequestStatusTimeline = ({ status, submittedAt, processedAt, deliveryDate }: {
  status: string
  submittedAt: Date | null
  processedAt?: Date | null
  deliveryDate?: Date | null
}) => {
  const steps = [
    { name: 'Submitted', date: submittedAt, done: true },
    { name: 'Processing', date: processedAt, done: status === 'processing' || status === 'completed' },
    { name: 'Completed', date: deliveryDate, done: status === 'completed' }
  ]

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              step.done ? 'bg-blue-500' : 'bg-gray-700'
            }`}>
              {step.done && <Check className="w-4 h-4 text-white" />}
            </div>
            <p className="text-xs text-gray-400 mt-1">{step.name}</p>
            {step.date && (
              <p className="text-xs text-gray-500">
                {step.date.toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CustomizedProspects() {
  const { userData } = useUser()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [creditUsed, setCreditUsed] = useState(0)
  const [requests, setRequests] = useState<ProspectRequest[]>([])
  const [formData, setFormData] = useState<Partial<ProspectRequest>>({
    companyName: '',
    email: '',
    numberOfProspects: 0,
    location: '',
    position: '',
    industry: '',
    apolloLink: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [requestToDelete, setRequestToDelete] = useState<ProspectRequest | null>(null)
  const [requestToEdit, setRequestToEdit] = useState<ProspectRequest | null>(null)
  const router = useRouter()

  const fetchRequests = async () => {
    if (!userData?.uid) return
    
    setIsLoading(true)
    try {
      const requestsRef = collection(db, 'customizedProspects')
      const q = query(
        requestsRef,
        where('userId', '==', userData.uid),
        orderBy('requestDate', 'desc')
      )
      
      const snapshot = await getDocs(q)
      const requestsData = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          submittedAt: data.submittedAt?.toDate() || null,
          requestDate: data.requestDate?.toDate() || null,
          deliveryDate: data.deliveryDate?.toDate() || null,
          processedAt: data.processedAt?.toDate() || null
        }
      }) as ProspectRequest[]

      console.log('Fetched requests:', requestsData) // Debug log

      setRequests(requestsData)

      // Calculate credit used this month
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyRequests = requestsData.filter(req => 
        req.requestDate && req.requestDate >= firstDayOfMonth
      )
      const used = monthlyRequests.reduce((sum, req) => sum + (req.numberOfProspects || 0), 0)
      setCreditUsed(used)
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast({
        title: 'Error',
        description: 'Failed to load request history. Please refresh the page.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!userData?.uid) return
    fetchRequests()
  }, [userData?.uid])

  useEffect(() => {
    if (requestToEdit) {
      setFormData({
        companyName: requestToEdit.companyName,
        email: requestToEdit.email,
        numberOfProspects: requestToEdit.numberOfProspects,
        location: requestToEdit.location || '',
        position: requestToEdit.position || '',
        industry: requestToEdit.industry || '',
        apolloLink: requestToEdit.apolloLink || ''
      })
      setIsDialogOpen(true)
    }
  }, [requestToEdit])

  if (userData?.plan !== 'pro') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Crown className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <CardTitle className="text-center text-xl">Pro Feature</CardTitle>
            <CardDescription className="text-center">
              Customized Prospects is available exclusively for Pro plan users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Pro Plan Benefits:</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Access to Customized Prospects
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    300 AI Email Generations Monthly
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Priority Support
                  </li>
                </ul>
              </div>
              
              <Button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={() => router.push('/portal/billing')}
              >
                Upgrade to Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData?.uid) return

    if (requestToEdit) {
      return handleUpdate(e)
    }

    const numberOfProspects = Number(formData.numberOfProspects)
    if (numberOfProspects + creditUsed > MONTHLY_CREDIT_LIMIT) {
      toast({
        title: 'Credit Limit Exceeded',
        description: `You only have ${MONTHLY_CREDIT_LIMIT - creditUsed} credits remaining this month`,
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const now = new Date()
      
      // Create the request data with proper types
      const requestData = {
        ...formData,
        status: 'pending' as const,
        submittedAt: serverTimestamp(),
        requestDate: now,
        requestTime: now.toLocaleTimeString(),
        userId: userData.uid
      }

      const requestRef = doc(collection(db, 'customizedProspects'))
      await setDoc(requestRef, {
        ...requestData,
        id: requestRef.id,
      })

      toast({
        title: 'Request Submitted',
        description: 'Your prospect request has been submitted successfully'
      })

      setIsDialogOpen(false)
      setFormData({
        companyName: '',
        email: '',
        numberOfProspects: 0,
        location: '',
        position: '',
        industry: '',
        apolloLink: ''
      })
      fetchRequests()
    } catch (error) {
      console.error('Error submitting request:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit request',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (request: ProspectRequest) => {
    if (!userData?.uid) return

    try {
      await deleteDoc(doc(db, 'customizedProspects', request.id))
      toast({
        title: 'Request Deleted',
        description: 'Your prospect request has been deleted successfully'
      })
      fetchRequests()
    } catch (error) {
      console.error('Error deleting request:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete request',
        variant: 'destructive'
      })
    } finally {
      setRequestToDelete(null)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData?.uid || !requestToEdit) return

    setIsSubmitting(true)
    try {
      const updatedData = {
        ...formData,
        updatedAt: serverTimestamp()
      }

      await updateDoc(doc(db, 'customizedProspects', requestToEdit.id), updatedData)

      toast({
        title: 'Request Updated',
        description: 'Your prospect request has been updated successfully'
      })

      setIsDialogOpen(false)
      setRequestToEdit(null)
      setFormData({
        companyName: '',
        email: '',
        numberOfProspects: 0,
        location: '',
        position: '',
        industry: '',
        apolloLink: ''
      })
      fetchRequests()
    } catch (error) {
      console.error('Error updating request:', error)
      toast({
        title: 'Error',
        description: 'Failed to update request',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.position?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default'
      case 'processing':
        return 'destructive'
      case 'completed':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Customized Prospects</h1>
            <p className="text-gray-400 max-w-2xl">
              Get targeted B2B prospects tailored to your needs. You have access to 2,000 prospects per month. 
              Our team will carefully curate prospects based on your requirements and deliver them within 24-48 hours.
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Users className="w-4 h-4 mr-2" />
            Request Prospects
          </Button>
        </div>

        <CreditProgressBar used={creditUsed} total={MONTHLY_CREDIT_LIMIT} />
      </div>

      {/* Request History */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Request History</h2>
        </div>
        <div className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-gray-400">Loading requests...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Requests Section */}
              <div className="grid grid-cols-1 gap-6">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="w-full hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">{request.companyName}</CardTitle>
                          <CardDescription>{request.email}</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={getStatusVariant(request.status)}
                            className="capitalize px-3 py-1"
                          >
                            {request.status}
                          </Badge>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRequestToEdit(request)}
                                className="hover:bg-gray-800"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRequestToDelete(request)}
                                className="hover:bg-red-900/20 hover:text-red-500"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>Prospects</span>
                        </div>
                        <p className="font-medium">{request.numberOfProspects.toLocaleString()}</p>
                      </div>
                      {request.location && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>Location</span>
                          </div>
                          <p className="font-medium">{request.location}</p>
                        </div>
                      )}
                      {request.industry && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Building className="w-4 h-4" />
                            <span>Industry</span>
                          </div>
                          <p className="font-medium">{request.industry}</p>
                        </div>
                      )}
                    </CardContent>
                    {request.status !== 'pending' && (
                      <div className="px-6 pb-6">
                        <RequestStatusTimeline 
                          status={request.status}
                          submittedAt={request.submittedAt}
                          processedAt={request.processedAt}
                          deliveryDate={request.deliveryDate}
                        />
                      </div>
                    )}
                    {request.status === 'completed' && request.deliveryLink && (
                      <CardFooter className="border-t bg-muted/50 p-4">
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25"
                          onClick={() => window.open(request.deliveryLink, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Prospects
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No requests found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {requestToEdit ? 'Edit Request' : 'Request Prospects'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill in your requirements and we'll curate prospects that match your needs.
              Our team will process your request within 24-48 hours.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.companyName}
                  onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter your company name"
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Number of Prospects <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    required
                    type="number"
                    min={1}
                    max={MONTHLY_CREDIT_LIMIT - creditUsed}
                    value={formData.numberOfProspects}
                    onChange={e => setFormData(prev => ({ ...prev, numberOfProspects: Number(e.target.value) }))}
                    placeholder={`Max ${MONTHLY_CREDIT_LIMIT - creditUsed}`}
                    className="bg-gray-800/50 border-gray-700"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    prospects
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., United States, Europe"
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  value={formData.position}
                  onChange={e => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="e.g., CEO, Sales Manager"
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Input
                  value={formData.industry}
                  onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., SaaS, Healthcare"
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Apollo Search Link</label>
              <Input
                value={formData.apolloLink}
                onChange={e => setFormData(prev => ({ ...prev, apolloLink: e.target.value }))}
                placeholder="Paste your Apollo search link"
                className="bg-gray-800/50 border-gray-700"
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {requestToEdit ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  requestToEdit ? 'Update Request' : 'Submit Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!requestToDelete} onOpenChange={(open) => !open && setRequestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prospect request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => requestToDelete && handleDelete(requestToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
