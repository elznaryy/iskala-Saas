'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  Filter,
  Download
} from "lucide-react"
import { db } from '@/lib/firebase/config'
import { collection, query, getDocs, doc, updateDoc, where, orderBy } from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  status: 'pending' | 'processing' | 'completed'
  submittedAt: Date
  requestDate: Date
  requestTime: string
  deliveryDate?: Date
  deliveryLink?: string
  notes?: string
  processedBy?: string
  processedAt?: Date
  user: {
    name: string
    email: string
    company: string
  }
}

export default function AdminCustomizedProspects() {
  const [requests, setRequests] = useState<ProspectRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<ProspectRequest | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      // First get all users for additional info
      const usersRef = collection(db, 'Users')
      const usersSnapshot = await getDocs(usersRef)
      const usersMap = new Map()
      
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data()
        usersMap.set(doc.id, {
          name: data.basicInfo?.name || 'Unknown',
          email: data.basicInfo?.email || 'Unknown',
          company: data.basicInfo?.companyName || 'Unknown'
        })
      })

      // Get all prospect requests
      const requestsRef = collection(db, 'customizedProspects')
      const q = query(requestsRef, orderBy('requestDate', 'desc'))
      const snapshot = await getDocs(q)

      const requestsData = snapshot.docs.map(doc => {
        const data = doc.data()
        const userData = usersMap.get(data.userId)
        return {
          ...data,
          id: doc.id,
          submittedAt: data.submittedAt?.toDate(),
          requestDate: data.requestDate?.toDate(),
          processedAt: data.processedAt?.toDate(),
          deliveryDate: data.deliveryDate?.toDate(),
          user: userData
        }
      }) as ProspectRequest[]

      setRequests(requestsData)
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  const updateRequestStatus = async (requestId: string, newStatus: ProspectRequest['status']) => {
    try {
      const requestRef = doc(db, 'customizedProspects', requestId)
      const updates: any = {
        status: newStatus,
        updatedAt: new Date()
      }

      if (newStatus === 'processing') {
        updates.processedAt = new Date()
      } else if (newStatus === 'completed') {
        updates.deliveryDate = new Date()
      }

      await updateDoc(requestRef, updates)
      toast.success('Status updated successfully')
      fetchRequests()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500'
      case 'processing': return 'bg-blue-500/10 text-blue-500'
      case 'completed': return 'bg-green-500/10 text-green-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Customized Prospects</h1>
          <p className="text-gray-400">Manage prospect requests from users</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search requests..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map(request => (
          <Card key={request.id} className="hover:shadow-lg transition-all">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{request.companyName}</CardTitle>
                  <CardDescription>{request.email}</CardDescription>
                </div>
                <Badge className={getStatusColor(request.status)}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{request.numberOfProspects} prospects</span>
                </div>
                {request.location && (
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-gray-500" />
                    <span>{request.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{request.requestDate.toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedRequest(request)
                      setShowDetails(true)
                    }}
                  >
                    View Details
                  </Button>
                  {request.status === 'pending' && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => updateRequestStatus(request.id, 'processing')}
                    >
                      Start Processing
                    </Button>
                  )}
                  {request.status === 'processing' && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => updateRequestStatus(request.id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Request Details</DialogTitle>
                <DialogDescription>
                  Submitted on {selectedRequest.submittedAt.toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Company</h3>
                    <p className="text-gray-500">{selectedRequest.companyName}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Contact</h3>
                    <p className="text-gray-500">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-gray-500">{selectedRequest.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Industry</h3>
                    <p className="text-gray-500">{selectedRequest.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Position</h3>
                    <p className="text-gray-500">{selectedRequest.position || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Prospects</h3>
                    <p className="text-gray-500">{selectedRequest.numberOfProspects}</p>
                  </div>
                </div>

                {selectedRequest.apolloLink && (
                  <div>
                    <h3 className="font-medium">Apollo Search Link</h3>
                    <a 
                      href={selectedRequest.apolloLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {selectedRequest.apolloLink}
                    </a>
                  </div>
                )}

                {selectedRequest.deliveryLink && (
                  <div>
                    <h3 className="font-medium">Delivery</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedRequest.deliveryLink, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Prospects
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 