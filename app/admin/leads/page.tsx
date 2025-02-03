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
import { Loader2, Pencil, Trash2, Plus, Star, Crown, Globe, Mail, Info, Link as LinkIcon, Users, Building2 } from 'lucide-react'
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
  planType: 'free' | 'starter' | 'pro'
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
  planType: 'free' | 'starter' | 'pro'
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
    
    const error = validateForm(formData)
    if (error) {
      toast.error(error)
      return
    }
    
    setIsLoading(true)

    try {
      const leadData = {
        ...formData,
        locations: formData.locations.split(',').map(s => s.trim()),
        industries: formData.industries.split(',').map(s => s.trim()),
        leadCount: Number(formData.leadCount),
        createdAt: editingId ? undefined : new Date(),
        updatedAt: new Date()
      }

      if (editingId) {
        const docRef = doc(db, 'leadContainers', editingId)
        await updateDoc(docRef, leadData)
        toast.success('Lead container updated')
      } else {
        await addDoc(collection(db, 'leadContainers'), leadData)
        toast.success('Lead container created')
      }

      setFormData(initialFormData)
      setEditingId(null)
      setIsDialogOpen(false)
      fetchLeads()
    } catch (error) {
      console.error('Error saving lead:', error)
      toast.error('Failed to save lead container')
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Lead Container Management</h1>
          <p className="text-gray-500 mt-1">Manage and organize lead containers for users</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2" variant="default">
              <Plus className="h-5 w-5" />
              Add New Lead Container
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingId ? 'Edit Lead Container' : 'Add New Lead Container'}
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to {editingId ? 'update' : 'create'} a lead container.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Container Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Tech Startups USA"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planType">Access Level</Label>
                  <Select
                    value={formData.planType}
                    onValueChange={value => setFormData(prev => ({ ...prev, planType: value as 'free' | 'starter' | 'pro' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Free Plan</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="starter">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          <span>Starter Plan</span>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadCount">Number of Leads</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="leadCount"
                      type="number"
                      className="pl-10"
                      placeholder="e.g., 5000"
                      value={formData.leadCount}
                      onChange={e => setFormData(prev => ({ ...prev, leadCount: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="hasVerifiedEmails">Email Verification</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Indicates if emails in this container are verified
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center space-x-2 h-10 px-3 rounded-md border">
                    <input
                      type="checkbox"
                      id="hasVerifiedEmails"
                      className="h-4 w-4"
                      checked={formData.hasVerifiedEmails}
                      onChange={e => setFormData(prev => ({ ...prev, hasVerifiedEmails: e.target.checked }))}
                    />
                    <Label htmlFor="hasVerifiedEmails">Verified Emails</Label>
                  </div>
                </div>
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="locations">Locations (comma-separated)</Label>
                <Input
                  id="locations"
                  value={formData.locations}
                  onChange={e => setFormData(prev => ({ ...prev, locations: e.target.value }))}
                  required
                />
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="industries">Industries (comma-separated)</Label>
                <Input
                  id="industries"
                  value={formData.industries}
                  onChange={e => setFormData(prev => ({ ...prev, industries: e.target.value }))}
                  required
                />
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="downloadUrl">Download URL</Label>
                <Input
                  id="downloadUrl"
                  value={formData.downloadUrl}
                  onChange={e => setFormData(prev => ({ ...prev, downloadUrl: e.target.value }))}
                  required
                />
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <Button type="submit" variant="default" className="w-full">
                {editingId ? 'Update' : 'Create'} Lead Container
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map(lead => (
          <Card key={lead.id} className="group hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{lead.name}</CardTitle>
                <Badge 
                  variant={lead.planType === 'pro' ? 'default' : lead.planType === 'starter' ? 'secondary' : 'outline'}
                  className="capitalize"
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
            <CardFooter className="border-t bg-muted/50 p-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEdit(lead)} 
                className="flex-1 h-9 bg-background hover:bg-accent"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1 h-9"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Lead Container</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this lead container? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(lead.id)}
                      className="bg-destructive hover:bg-destructive/90"
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
    </div>
  )
}