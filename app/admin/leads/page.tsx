'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'react-hot-toast'
import { db } from '@/lib/firebase/config'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { Loader2, Pencil, Trash2, Plus, Star, Crown, Globe, Mail, Info, Link as LinkIcon, Users, Building2, Search, Database } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface LeadContainer {
  id: string
  name: string
  planType: 'free' | 'pro'
  leadCount: number
  locations: string[]
  industries: string[]
  hasVerifiedEmails: boolean
  downloadUrl: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

interface LeadContainerFormData {
  name: string
  planType: 'free' | 'pro'
  leadCount: number
  locations: string
  industries: string
  hasVerifiedEmails: boolean
  downloadUrl: string
  description: string
}

const initialFormData: LeadContainerFormData = {
  name: '',
  planType: 'free',
  leadCount: 0,
  locations: '',
  industries: '',
  hasVerifiedEmails: false,
  downloadUrl: '',
  description: ''
}

export default function LeadsManagement() {
  const [leads, setLeads] = useState<LeadContainer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<LeadContainerFormData>(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const leadsRef = collection(db, 'leadContainers')
      const snapshot = await getDocs(leadsRef)
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as LeadContainer[]
      
      setLeads(leadsData)
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast.error('Failed to load leads')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate leadCount is a number
    const leadCount = parseInt(formData.leadCount.toString())
    if (isNaN(leadCount)) {
      toast.error('Lead count must be a valid number')
      return
    }
    
    const error = validateForm(formData)
    if (error) {
      toast.error(error)
      return
    }
    
    setIsLoading(true)

    try {
      // Base data object
      const baseData = {
        name: formData.name.trim(),
        planType: formData.planType,
        leadCount: leadCount,
        locations: formData.locations.split(',').map(s => s.trim()).filter(Boolean),
        industries: formData.industries.split(',').map(s => s.trim()).filter(Boolean),
        hasVerifiedEmails: formData.hasVerifiedEmails,
        downloadUrl: formData.downloadUrl.trim(),
        description: formData.description?.trim() || '',
        updatedAt: new Date()
      }

      if (editingId) {
        // For updates, don't include createdAt
        const docRef = doc(db, 'leadContainers', editingId)
        await updateDoc(docRef, baseData)
        toast.success('Lead container updated')
      } else {
        // For new documents, include createdAt
        const newData = {
          ...baseData,
          createdAt: new Date()
        }
        await addDoc(collection(db, 'leadContainers'), newData)
        toast.success('Lead container created')
      }

      setFormData(initialFormData)
      setEditingId(null)
      setIsDialogOpen(false)
      fetchLeads()
    } catch (error) {
      console.error('Error saving lead:', error)
      if (error instanceof Error) {
        toast.error(`Failed to save: ${error.message}`)
      } else {
        toast.error('Failed to save lead container. Please check your permissions.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (data: LeadContainerFormData) => {
    if (!data.name.trim()) return 'Name is required'
    if (data.leadCount <= 0) return 'Lead count must be greater than 0'
    if (!data.locations.trim()) return 'At least one location is required'
    if (!data.industries.trim()) return 'At least one industry is required'
    if (!data.downloadUrl.trim()) return 'Download URL is required'
    return null
  }

  const handleEdit = (lead: LeadContainer) => {
    setFormData({
      name: lead.name,
      planType: lead.planType,
      leadCount: lead.leadCount,
      locations: lead.locations.join(', '),
      industries: lead.industries.join(', '),
      hasVerifiedEmails: lead.hasVerifiedEmails,
      downloadUrl: lead.downloadUrl,
      description: lead.description || ''
    })
    setEditingId(lead.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead container?')) return

    setIsLoading(true)
    try {
      await deleteDoc(doc(db, 'leadContainers', id))
      toast.success('Lead container deleted')
      fetchLeads()
    } catch (error) {
      console.error('Error deleting lead:', error)
      toast.error('Failed to delete lead container')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.industries.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.locations.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesPlan = filterPlan === 'all' || lead.planType === filterPlan

    return matchesSearch && matchesPlan
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header Section with Search and Filters */}
      <div className="space-y-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Lead Container Management
            </h1>
            <p className="text-gray-400 mt-1">Manage and organize lead containers for users</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl gap-2"
              >
                <Plus className="h-5 w-5" />
                Add New Lead Container
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-bold">
                  {editingId ? 'Edit Lead Container' : 'Add New Lead Container'}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Fill in the details below to {editingId ? 'update' : 'create'} a lead container.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-200">Basic Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-200">Container Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Tech Startups USA"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full bg-gray-800 border-gray-700 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="planType" className="text-sm font-medium text-gray-200">Access Level</Label>
                      <Select
                        value={formData.planType}
                        onValueChange={value => setFormData(prev => ({ ...prev, planType: value as 'free' | 'pro' }))}
                      >
                        <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="free">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>Free Plan</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="pro">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4" />
                              <span>Pro Plan</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Leads Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-200">Leads Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="leadCount" className="text-sm font-medium text-gray-200">Number of Leads</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="leadCount"
                          type="number"
                          min="0"
                          step="1"
                          className="pl-10 bg-gray-800 border-gray-700 focus:border-blue-500"
                          placeholder="e.g., 5000"
                          value={formData.leadCount || ''}
                          onChange={e => {
                            const value = e.target.value ? parseInt(e.target.value) : 0
                            if (!isNaN(value) && value >= 0) {
                              setFormData(prev => ({ ...prev, leadCount: value }))
                            }
                          }}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hasVerifiedEmails" className="text-sm font-medium text-gray-200">Email Verification</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Indicates if emails in this container are verified
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center h-10 px-4 rounded-md border border-gray-700 bg-gray-800">
                        <input
                          type="checkbox"
                          id="hasVerifiedEmails"
                          className="h-4 w-4"
                          checked={formData.hasVerifiedEmails}
                          onChange={e => setFormData(prev => ({ ...prev, hasVerifiedEmails: e.target.checked }))}
                        />
                        <Label htmlFor="hasVerifiedEmails" className="ml-2 text-gray-200">Verified Emails</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location and Industry Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-200">Target Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="locations" className="text-sm font-medium text-gray-200">Locations</Label>
                      <Input
                        id="locations"
                        placeholder="e.g., USA, Canada, UK"
                        value={formData.locations}
                        onChange={e => setFormData(prev => ({ ...prev, locations: e.target.value }))}
                        required
                        className="bg-gray-800 border-gray-700 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-400">Separate multiple locations with commas</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industries" className="text-sm font-medium text-gray-200">Industries</Label>
                      <Input
                        id="industries"
                        placeholder="e.g., Technology, Healthcare"
                        value={formData.industries}
                        onChange={e => setFormData(prev => ({ ...prev, industries: e.target.value }))}
                        required
                        className="bg-gray-800 border-gray-700 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-400">Separate multiple industries with commas</p>
                    </div>
                  </div>
                </div>

                {/* Additional Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-200">Additional Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="downloadUrl" className="text-sm font-medium text-gray-200">Download URL</Label>
                    <Input
                      id="downloadUrl"
                      placeholder="https://..."
                      value={formData.downloadUrl}
                      onChange={e => setFormData(prev => ({ ...prev, downloadUrl: e.target.value }))}
                      required
                      className="bg-gray-800 border-gray-700 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-200">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter a detailed description of the lead container..."
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[100px] resize-y bg-gray-800 border-gray-700 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="bg-gray-800 hover:bg-gray-700 border-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        {editingId ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingId ? 'Update Lead Container' : 'Create Lead Container'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search leads..."
              className="pl-10 bg-gray-800/50 border-gray-700 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={filterPlan}
            onValueChange={setFilterPlan}
          >
            <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700">
              <SelectValue placeholder="Filter by plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free Plan</SelectItem>
              <SelectItem value="pro">Pro Plan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lead Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map(lead => (
          <Card 
            key={lead.id} 
            className="group hover:shadow-xl transition-all duration-200 bg-gray-800/50 border-gray-700 hover:border-blue-500/50"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">
                  {lead.name}
                </CardTitle>
                <Badge 
                  variant={lead.planType === 'pro' ? 'default' : 'outline'}
                  className={`capitalize ${
                    lead.planType === 'pro' 
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                      : 'border-gray-600'
                  }`}
                >
                  {lead.planType}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{lead.leadCount.toLocaleString()} Leads</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Locations</p>
                    <p className="text-sm text-gray-500">{lead.locations.join(', ')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Industries</p>
                    <p className="text-sm text-gray-500">{lead.industries.join(', ')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Email Status</p>
                    <Badge variant={lead.hasVerifiedEmails ? "success" : "warning"}>
                      {lead.hasVerifiedEmails ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-700/50 bg-gray-900/30 p-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEdit(lead)} 
                className="flex-1 h-9 bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-blue-500/50"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="flex-1 h-9 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Lead Container</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to delete this lead container? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(lead.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-800/50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Database className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300">No leads found</h3>
          <p className="text-gray-400 mt-2">
            {searchTerm ? 'Try adjusting your search or filters' : 'Start by adding a new lead container'}
          </p>
        </div>
      )}
    </div>
  )
}