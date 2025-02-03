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
  Filter,
  Mail,
  Copy,
  Database,
  Loader2,
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  CreditCard,
  GraduationCap
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

type RequestType = 'email' | 'copy' | 'data' | 'lms'
type RequestStatus = 'pending' | 'communication' | 'payment' | 'in_progress' | 'done'
type TimeFilter = 'today' | 'this_month' | 'last_3_months' | 'this_year' | 'last_year' | 'all_time'

interface SupportRequest {
  id: string
  userId: string
  type: RequestType
  status: RequestStatus
  createdAt: Date
  updatedAt: Date
  details: {
    title?: string
    description: string
    requirements?: string[]
    attachments?: string[]
  }
  user: {
    name: string
    email: string
    company: string
  }
}

const STATUS_COLORS = {
  pending: 'bg-yellow-500',
  communication: 'bg-blue-500',
  payment: 'bg-purple-500',
  in_progress: 'bg-orange-500',
  done: 'bg-green-500'
}

const STATUS_LABELS = {
  pending: 'Pending',
  communication: 'Communication',
  payment: 'Payment',
  in_progress: 'In Progress',
  done: 'Done'
}

const TIME_FILTERS: Record<TimeFilter, string> = {
  today: 'Today',
  this_month: 'This Month',
  last_3_months: 'Last 3 Months',
  this_year: 'This Year',
  last_year: 'Last Year',
  all_time: 'All Time'
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
}

const slideIn = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
}

type DragItem = {
  id: string
  status: RequestStatus
}

const DroppableColumn = ({ status, children }: { status: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        "flex flex-col space-y-4 min-h-[500px] p-2 rounded-lg transition-colors duration-200",
        isOver ? "bg-gray-800/50" : "bg-transparent"
      )}
    >
      {children}
    </div>
  )
}

const DraggableCard = ({ 
  request, 
  isActive,
  onStatusUpdate,
  onSelect
}: { 
  request: SupportRequest
  isActive: boolean
  onStatusUpdate: (requestId: string, type: RequestType, status: RequestStatus) => Promise<void>
  onSelect: (request: SupportRequest) => void
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: request.id,
    data: {
      type: request.type,
      currentStatus: request.status
    }
  })

  return (
    <div 
      ref={setNodeRef} 
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition: transform ? 'none' : 'transform 200ms ease',
      }}
      className={cn(
        "touch-none",
        isActive && "z-50"
      )}
    >
      <div {...listeners} {...attributes}>
        <Card
          className={cn(
            "p-4 cursor-move group hover:shadow-md transition-all duration-200",
            "border-l-4",
            request.type === 'email' ? 'border-l-blue-500' :
            request.type === 'copy' ? 'border-l-purple-500' :
            request.type === 'data' ? 'border-l-green-500' :
            'border-l-orange-500',
            isActive && 'opacity-50 scale-105 rotate-2'
          )}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(request)
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge
                variant={request.type === 'email' ? 'default' : 
                        request.type === 'copy' ? 'secondary' :
                        request.type === 'data' ? 'destructive' : 'outline'}
                className="transition-transform group-hover:scale-105"
              >
                {request.type.toUpperCase()}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {Object.entries(STATUS_LABELS).map(([newStatus, label]) => (
                    <DropdownMenuItem
                      key={newStatus}
                      onClick={(e) => {
                        e.stopPropagation()
                        onStatusUpdate(request.id, request.type, newStatus as RequestStatus)
                      }}
                      className="flex items-center space-x-2"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        STATUS_COLORS[newStatus as RequestStatus]
                      )} />
                      <span>Move to {label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div onClick={() => {
              onSelect(request)
            }}>
              <h3 className="font-medium truncate group-hover:text-blue-600 transition-colors">
                {request.details.title || 'Untitled Request'}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {request.user.name} - {request.user.company}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(request.createdAt)}
              </div>
              <div className="flex items-center space-x-1">
                {request.details.requirements?.length && (
                  <div className="flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {request.details.requirements.length}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

const formatDate = (date: Date): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

export default function SupportRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<RequestType | 'all'>('all')
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all_time')
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const allRequests: SupportRequest[] = []

      // Fetch email requests
      const emailRef = collection(db, 'emailRequests')
      const emailSnapshot = await getDocs(emailRef)

      // Fetch copy requests
      const copyRef = collection(db, 'copyRequests')
      const copySnapshot = await getDocs(copyRef)

      // Get all users for reference
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

      // Helper function to safely convert Firestore timestamp
      const safeDate = (timestamp: any): Date => {
        if (!timestamp) return new Date()
        
        try {
          if (timestamp.toDate) {
            return timestamp.toDate()
          }
          if (timestamp instanceof Date) {
            return timestamp
          }
          if (typeof timestamp === 'string') {
            const date = new Date(timestamp)
            return isNaN(date.getTime()) ? new Date() : date
          }
          return new Date(timestamp)
        } catch (error) {
          console.error('Error parsing date:', error)
          return new Date()
        }
      }

      // Process email requests
      emailSnapshot.docs.forEach(doc => {
        const data = doc.data()
        const userData = usersMap.get(data.userId)
        if (data) {
          allRequests.push({
            id: doc.id,
            userId: data.userId || 'unknown',
            type: 'email',
            status: data.status || 'pending',
            createdAt: safeDate(data.createdAt),
            updatedAt: safeDate(data.updatedAt),
            details: {
              title: data.title || '',
              description: data.description || '',
              requirements: data.requirements || []
            },
            user: userData || {
              name: 'Unknown',
              email: 'Unknown',
              company: 'Unknown'
            }
          })
        }
      })

      // Process copy requests
      copySnapshot.docs.forEach(doc => {
        const data = doc.data()
        const userData = usersMap.get(data.userId)
        if (data) {
          allRequests.push({
            id: doc.id,
            userId: data.userId || 'unknown',
            type: 'copy',
            status: data.status || 'pending',
            createdAt: safeDate(data.createdAt),
            updatedAt: safeDate(data.updatedAt),
            details: {
              title: data.title || '',
              description: data.description || '',
              requirements: data.requirements || []
            },
            user: userData || {
              name: 'Unknown',
              email: 'Unknown',
              company: 'Unknown'
            }
          })
        }
      })

      // Sort by date with error handling
      allRequests.sort((a, b) => {
        try {
          return b.createdAt.getTime() - a.createdAt.getTime()
        } catch (error) {
          return 0 // Keep original order if dates are invalid
        }
      })

      setRequests(allRequests)
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  const updateRequestStatus = async (requestId: string, type: RequestType, newStatus: RequestStatus) => {
    try {
      const collectionName = type === 'email' ? 'emailRequests' : 'copyRequests'
      const requestRef = doc(db, collectionName, requestId)
      
      await updateDoc(requestRef, {
        status: newStatus,
        updatedAt: new Date()
      })

      toast.success('Status updated successfully')
      fetchRequests()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const isWithinTimeFilter = (date: Date) => {
    const now = new Date()
    const inputDate = new Date(date)
    
    // Reset hours to compare just dates
    inputDate.setHours(0, 0, 0, 0)
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    
    switch (timeFilter) {
      case 'today': {
        // Compare year, month, and day
        return inputDate.getFullYear() === today.getFullYear() &&
               inputDate.getMonth() === today.getMonth() &&
               inputDate.getDate() === today.getDate()
      }
      
      case 'this_month': {
        // Compare year and month
        return inputDate.getFullYear() === today.getFullYear() &&
               inputDate.getMonth() === today.getMonth()
      }
      
      case 'last_3_months': {
        const threeMonthsAgo = new Date(today)
        threeMonthsAgo.setMonth(today.getMonth() - 3)
        return inputDate >= threeMonthsAgo && inputDate <= today
      }
      
      case 'this_year': {
        return inputDate.getFullYear() === today.getFullYear()
      }
      
      case 'last_year': {
        return inputDate.getFullYear() === today.getFullYear() - 1
      }
      
      default: // 'all_time'
        return true
    }
  }

  const getFilteredRequests = () => {
    return requests.filter(request => {
      const matchesSearch = 
        request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.details.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.details.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = filterType === 'all' || request.type === filterType
      const matchesTime = isWithinTimeFilter(request.createdAt)

      // Debug log
      if (timeFilter === 'today') {
        console.log('Request date:', request.createdAt, 'Matches time filter:', matchesTime)
      }

      return matchesSearch && matchesType && matchesTime
    })
  }

  const getRequestsByStatus = (status: RequestStatus) => {
    return getFilteredRequests().filter(request => request.status === status)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return

    const activeRequest = requests.find(r => r.id === active.id)
    const newStatus = over.id as RequestStatus

    if (activeRequest && activeRequest.status !== newStatus) {
      try {
        const collectionName = activeRequest.type === 'email' ? 'emailRequests' : 'copyRequests'
        const requestRef = doc(db, collectionName, activeRequest.id)
        
        // Optimistically update UI
        setRequests(prev => prev.map(req => 
          req.id === activeRequest.id 
            ? { ...req, status: newStatus, updatedAt: new Date() }
            : req
        ))

        // Update Firestore
        await updateDoc(requestRef, {
          status: newStatus,
          updatedAt: new Date()
        })

        toast.success(`Moved to ${STATUS_LABELS[newStatus]}`)
      } catch (error) {
        // Revert on error
        setRequests(prev => prev.map(req => 
          req.id === activeRequest.id 
            ? { ...req, status: activeRequest.status }
            : req
        ))
        console.error('Error updating status:', error)
        toast.error('Failed to update status')
      }
    }

    setActiveId(null)
  }

  const RequestDetailsDialog = () => {
    if (!selectedRequest) return null

    const getStatusIcon = (status: RequestStatus) => {
      switch (status) {
        case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
        case 'communication': return <MessageCircle className="w-4 h-4 text-blue-500" />
        case 'payment': return <CreditCard className="w-4 h-4 text-purple-500" />
        case 'in_progress': return <Loader2 className="w-4 h-4 text-orange-500" />
        case 'done': return <CheckCircle2 className="w-4 h-4 text-green-500" />
        default: return <AlertCircle className="w-4 h-4 text-gray-500" />
      }
    }

    const getTypeIcon = (type: RequestType) => {
      switch (type) {
        case 'email': return <Mail className="w-4 h-4" />
        case 'copy': return <Copy className="w-4 h-4" />
        case 'data': return <Database className="w-4 h-4" />
        case 'lms': return <GraduationCap className="w-4 h-4" />
        default: return null
      }
    }

    return (
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {getTypeIcon(selectedRequest.type)}
              <span>{selectedRequest.details.title || 'Untitled Request'}</span>
            </DialogTitle>
            <DialogDescription>
              Request ID: {selectedRequest.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status and Type */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {getStatusIcon(selectedRequest.status)}
                <span className="capitalize">{STATUS_LABELS[selectedRequest.status]}</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {selectedRequest.type} Request
              </Badge>
            </div>

            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {selectedRequest.user.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {selectedRequest.user.email}
                </div>
                <div>
                  <span className="font-medium">Company:</span> {selectedRequest.user.company}
                </div>
              </CardContent>
            </Card>

            {/* Request Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Description</h4>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.details.description}
                  </p>
                </div>

                {selectedRequest.details.requirements && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Requirements</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {selectedRequest.details.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Created</span>
                  <span>{selectedRequest.createdAt.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Last Updated</span>
                  <span>{selectedRequest.updatedAt.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Select
                value={selectedRequest.status}
                onValueChange={(value: RequestStatus) => {
                  updateRequestStatus(selectedRequest.id, selectedRequest.type, value)
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([status, label]) => (
                    <SelectItem key={status} value={status}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Support Requests</h1>
          <p className="text-gray-400">Manage and track support requests</p>
        </div>
        
        <div className="flex space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search requests..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_FILTERS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email Requests</SelectItem>
              <SelectItem value="copy">Copy Requests</SelectItem>
              <SelectItem value="data">Data Requests</SelectItem>
              <SelectItem value="lms">LMS Requests</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getRequestsByStatus(status as RequestStatus).length}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-5 gap-6">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex flex-col space-y-4">
              <div className={cn(
                "p-3 rounded-lg text-white font-medium shadow-lg",
                STATUS_COLORS[status as RequestStatus]
              )}>
                <div className="flex items-center justify-between">
                  <span>{label}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                    {getRequestsByStatus(status as RequestStatus).length}
                  </span>
                </div>
              </div>
              
              <DroppableColumn status={status}>
                {getRequestsByStatus(status as RequestStatus).map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DraggableCard
                      request={request}
                      isActive={activeId === request.id}
                      onStatusUpdate={updateRequestStatus}
                      onSelect={(req) => {
                        setSelectedRequest(req)
                        setShowDetails(true)
                      }}
                    />
                  </motion.div>
                ))}
              </DroppableColumn>
            </div>
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <div className="transform rotate-3 pointer-events-none">
              <Card className="p-4 shadow-xl border-2 border-blue-500 w-[300px] bg-white/90 backdrop-blur">
                {requests.find(r => r.id === activeId)?.details.title || 'Untitled Request'}
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      )}

      <RequestDetailsDialog />
    </div>
  )
} 