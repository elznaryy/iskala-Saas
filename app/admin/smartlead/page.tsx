'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calendar,
  Building2,
  Mail,
  User,
  Clock
} from "lucide-react"
import { db } from '@/lib/firebase/config'
import { collection, query, getDocs, doc, updateDoc, where, orderBy } from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SmartleadRequest {
  id: string
  userId: string
  email: string
  companyName: string
  status: 'pending' | 'active'
  submittedAt: Date
  basicInfo?: {
    name: string
    email: string
  }
}

const dateFilters = {
  'all': 'All Time',
  'this-year': 'This Year',
  'last-month': 'Last Month',
  'this-quarter': 'This Quarter',
  'last-quarter': 'Last Quarter'
}

export default function SmartleadManagement() {
  const [requests, setRequests] = useState<SmartleadRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<SmartleadRequest | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const fetchSmartleadRequests = async () => {
    try {
      const smartleadRef = collection(db, 'smartlead')
      const q = query(smartleadRef, orderBy('submittedAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const requestsData = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data()
        // Get user info if available
        let userInfo = null
        if (data.userId) {
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', data.userId)))
          if (!userDoc.empty) {
            userInfo = userDoc.docs[0].data()
          }
        }
        
        return {
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate(),
          basicInfo: userInfo?.basicInfo
        }
      }))

      setRequests(requestsData as SmartleadRequest[])
    } catch (error) {
      console.error('Error fetching smartlead requests:', error)
      toast.error('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSmartleadRequests()
  }, [])

  const handleStatusUpdate = async (requestId: string, newStatus: 'pending' | 'active') => {
    try {
      const docRef = doc(db, 'smartlead', requestId)
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date()
      })
      
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ))
      
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const getFilteredRequests = () => {
    let filtered = requests

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.basicInfo?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Date filter
    const now = new Date()
    switch (dateFilter) {
      case 'this-year':
        filtered = filtered.filter(req => 
          req.submittedAt.getFullYear() === now.getFullYear()
        )
        break
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
        filtered = filtered.filter(req => 
          req.submittedAt.getMonth() === lastMonth.getMonth() &&
          req.submittedAt.getFullYear() === lastMonth.getFullYear()
        )
        break
      case 'this-quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3)
        filtered = filtered.filter(req => req.submittedAt >= quarterStart)
        break
      // Add more date filters as needed
    }

    return filtered
  }

  const filteredRequests = getFilteredRequests()

  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <div className="space-y-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            SmartLead Requests
          </h1>
          <p className="text-gray-400 mt-1">Manage and verify SmartLead integration requests</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by email, company, or name..."
              className="pl-10 bg-gray-800/50 border-gray-700 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={dateFilter}
            onValueChange={setDateFilter}
          >
            <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(dateFilters).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map(request => (
          <Card 
            key={request.id}
            className="group hover:shadow-xl transition-all duration-200 bg-gray-800/50 border-gray-700 hover:border-blue-500/50"
          >
            <CardHeader className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">
                    {request.companyName}
                  </CardTitle>
                  <CardDescription>{request.basicInfo?.name || 'Unknown User'}</CardDescription>
                </div>
                <Badge 
                  variant={request.status === 'active' ? 'default' : 'outline'}
                  className={`capitalize ${
                    request.status === 'active' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}
                >
                  {request.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-400">{request.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Submitted</p>
                  <p className="text-sm text-gray-400">
                    {request.submittedAt.toLocaleDateString()} at{' '}
                    {request.submittedAt.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => {
                    setSelectedRequest(request)
                    setIsDetailsOpen(true)
                  }}
                  variant="outline"
                  className="flex-1 bg-gray-800 hover:bg-gray-700 border-gray-600"
                >
                  View Details
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(
                    request.id, 
                    request.status === 'pending' ? 'active' : 'pending'
                  )}
                  variant={request.status === 'pending' ? 'default' : 'destructive'}
                  className="flex-1"
                >
                  {request.status === 'pending' ? 'Approve' : 'Revoke'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about the SmartLead request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Company Name</p>
                  <p className="font-medium">{selectedRequest.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <Badge 
                    variant={selectedRequest.status === 'active' ? 'default' : 'outline'}
                    className="mt-1"
                  >
                    {selectedRequest.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Submitted At</p>
                  <p className="font-medium">
                    {selectedRequest.submittedAt.toLocaleDateString()}
                  </p>
                </div>
                {selectedRequest.basicInfo && (
                  <>
                    <div>
                      <p className="text-sm text-gray-400">User Name</p>
                      <p className="font-medium">{selectedRequest.basicInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">User Email</p>
                      <p className="font-medium">{selectedRequest.basicInfo.email}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                  className="bg-gray-800 hover:bg-gray-700 border-gray-600"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleStatusUpdate(
                      selectedRequest.id,
                      selectedRequest.status === 'pending' ? 'active' : 'pending'
                    )
                    setIsDetailsOpen(false)
                  }}
                  variant={selectedRequest.status === 'pending' ? 'default' : 'destructive'}
                >
                  {selectedRequest.status === 'pending' ? 'Approve Request' : 'Revoke Access'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-800/50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300">No requests found</h3>
          <p className="text-gray-400 mt-2">
            {searchTerm || dateFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No SmartLead requests at the moment'}
          </p>
        </div>
      )}
    </div>
  )
} 