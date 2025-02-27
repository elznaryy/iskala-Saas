'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from '@/components/ui/badge'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Mail,
  Building2,
  Globe,
  Loader2,
  Sparkles,
  Variable,
  Crown,
  Users,
  Info,
  Search
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { db } from '@/lib/firebase/config'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

// Interfaces
interface EmailTemplate {
  id: string
  title: string
  body: string
  description: string
  variables: string[]
  score: number
  type: 'free' | 'premium'
  platform: 'smartlead' | 'linkedin'
  industry: string
  location: string
  replyRate: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface TemplateFormData {
  title: string
  body: string
  description: string
  variables: string
  score: number
  type: 'free' | 'premium'
  platform: 'smartlead' | 'linkedin'
  industry: string
  location: string
  replyRate: number
  tags: string
}

// Initial form data
const initialFormData: TemplateFormData = {
  title: '',
  body: '',
  description: '',
  variables: '',
  score: 80,
  type: 'free',
  platform: 'smartlead',
  industry: '',
  location: '',
  replyRate: 0,
  tags: ''
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const templatesRef = collection(db, 'emailTemplates')
      const snapshot = await getDocs(templatesRef)
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as EmailTemplate[]
      
      setTemplates(templatesData)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare base template data
      const templateData = {
        title: formData.title,
        body: formData.body,
        description: formData.description,
        variables: formData.variables.split(',').map(v => v.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        score: Number(formData.score),
        replyRate: Number(formData.replyRate),
        type: formData.type,
        platform: formData.platform,
        industry: formData.industry,
        location: formData.location,
        updatedAt: serverTimestamp()
      }

      if (editingId) {
        // Update existing template
        const docRef = doc(db, 'emailTemplates', editingId)
        await updateDoc(docRef, templateData)
        toast.success('Template updated successfully')
      } else {
        // Create new template
        const newTemplateData = {
          ...templateData,
          createdAt: serverTimestamp()
        }
        await addDoc(collection(db, 'emailTemplates'), newTemplateData)
        toast.success('Template created successfully')
      }

      setFormData(initialFormData)
      setEditingId(null)
      setIsDialogOpen(false)
      await fetchTemplates()
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (template: EmailTemplate) => {
    setFormData({
      title: template.title,
      body: template.body,
      description: template.description,
      variables: template.variables.join(', '),
      score: template.score,
      type: template.type,
      platform: template.platform,
      industry: template.industry,
      location: template.location,
      replyRate: template.replyRate,
      tags: template.tags.join(', ')
    })
    setEditingId(template.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (templateId: string) => {
    try {
      await deleteDoc(doc(db, 'emailTemplates', templateId))
      setTemplates(prev => prev.filter(t => t.id !== templateId))
      toast.success('Template deleted successfully')
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <div className="space-y-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Email Templates
            </h1>
            <p className="text-gray-400 mt-1">Manage your email templates library</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl gap-2"
              >
                <Plus className="h-5 w-5" />
                Add New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Template' : 'Add New Template'}</DialogTitle>
                <DialogDescription>
                  Fill in the template details below
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., SaaS Cold Outreach"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={value => setFormData(prev => ({ ...prev, type: value as 'free' | 'premium' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free Template</SelectItem>
                        <SelectItem value="premium">Premium Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Template Content */}
                <div className="space-y-2">
                  <Label htmlFor="body">Email Body</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    className="min-h-[200px] font-mono"
                    placeholder="Enter your email template here..."
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe when and how to use this template..."
                    className="h-20"
                  />
                </div>

                {/* Industry & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g., SaaS, Healthcare"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., United States, Europe"
                      required
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">Quality Score (1-100)</Label>
                    <Input
                      id="score"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.score}
                      onChange={e => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="replyRate">Reply Rate (%)</Label>
                    <Input
                      id="replyRate"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.replyRate}
                      onChange={e => setFormData(prev => ({ ...prev, replyRate: parseInt(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                </div>

                {/* Platform */}
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={value => setFormData(prev => ({ ...prev, platform: value as 'smartlead' | 'linkedin' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smartlead">SmartLead</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Variables & Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="variables">Variables (comma-separated)</Label>
                    <Input
                      id="variables"
                      value={formData.variables}
                      onChange={e => setFormData(prev => ({ ...prev, variables: e.target.value }))}
                      placeholder="firstName, companyName, industry"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="cold-outreach, follow-up"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false)
                      setFormData(initialFormData)
                      setEditingId(null)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingId ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>{editingId ? 'Update Template' : 'Create Template'}</>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 focus:border-blue-500"
            />
          </div>
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="free">Free Templates</SelectItem>
              <SelectItem value="premium">Premium Templates</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card 
            key={template.id} 
            className="group hover:shadow-xl transition-all duration-200 bg-gray-800/50 border-gray-700 hover:border-blue-500/50"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">
                  {template.title}
                </CardTitle>
                <Badge 
                  variant={template.type === 'premium' ? 'default' : 'outline'}
                  className={`capitalize ${
                    template.type === 'premium' 
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                      : 'border-gray-600'
                  }`}
                >
                  {template.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-400 mt-2">{template.description}</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Performance</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>Score: {template.score}/100</span>
                      <span>•</span>
                      <span>Reply Rate: {template.replyRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Industry</p>
                    <p className="text-sm text-gray-400">{template.industry}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-400">{template.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Variable className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Variables</p>
                    <p className="text-sm text-gray-400">
                      {template.variables.join(', ')}
                    </p>
                  </div>
                </div>

                {template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {template.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="border-t border-gray-700/50 bg-gray-900/30 p-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEdit(template)} 
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
                    <AlertDialogTitle>Delete Template</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to delete this template? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(template.id)}
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
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-800/50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300">No templates found</h3>
          <p className="text-gray-400 mt-2">
            {searchTerm ? 'Try adjusting your search or filters' : 'Start by adding a new template'}
          </p>
        </div>
      )}
    </div>
  )
} 