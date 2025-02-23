'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  Mail, 
  Building2,
  Globe,
  Sparkles,
  Variable,
  Copy,
  Lock,
  X
} from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { useUser } from '@/contexts/UserContext'
import { db } from '@/lib/firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

// Types
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

// Add new interfaces for filtering
interface FilterOptions {
  industry: string | 'all'
  location: string | 'all'
  type: 'all' | 'free' | 'premium'
  platform: 'all' | 'smartlead' | 'linkedin'
  sortBy: 'score' | 'replyRate' | 'date'
}

export default function CustomCopy() {
  const { userData } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({
    industry: 'all',
    location: 'all',
    type: 'all',
    platform: 'all',
    sortBy: 'score'
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const ITEMS_PER_PAGE = 9

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
      toast({
        title: 'Error',
        description: 'Failed to load email templates',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const canAccessTemplate = (template: EmailTemplate) => {
    const userPlan = userData?.plan || 'free'
    return template.type === 'free' || userPlan === 'pro'
  }

  const handleCopyTemplate = async (template: EmailTemplate) => {
    if (!canAccessTemplate(template)) {
      toast({
        title: 'Premium Template',
        description: 'Please upgrade your plan to access premium templates',
        variant: 'destructive'
      })
      return
    }

    try {
      // Only copy the email body
      await navigator.clipboard.writeText(template.body)
      toast({
        title: 'Copied!',
        description: 'Email template copied to clipboard',
      })
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: 'Error',
        description: 'Failed to copy template',
        variant: 'destructive'
      })
    }
  }

  // Get unique industries and locations for filter dropdowns
  const industries = useMemo(() => 
    [...new Set(templates.map(t => t.industry))],
    [templates]
  )
  
  const locations = useMemo(() => 
    [...new Set(templates.map(t => t.location))],
    [templates]
  )

  // Enhanced filtering with multiple criteria
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = 
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesIndustry = 
        filters.industry === 'all' || template.industry === filters.industry

      const matchesLocation = 
        filters.location === 'all' || template.location === filters.location

      const matchesType = 
        filters.type === 'all' || template.type === filters.type

      const matchesPlatform = 
        filters.platform === 'all' || template.platform === filters.platform

      return matchesSearch && matchesIndustry && matchesLocation && 
             matchesType && matchesPlatform
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'score':
          return b.score - a.score
        case 'replyRate':
          return b.replyRate - a.replyRate
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime()
        default:
          return 0
      }
    })
  }, [templates, searchQuery, filters])

  // Pagination
  const paginatedTemplates = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filteredTemplates.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredTemplates, page])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header with Search and Filters */}
      <div className="space-y-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Email Templates
            </h1>
            <p className="text-gray-400 mt-1">Browse and customize professional email templates</p>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}
            >
              <SelectTrigger className="w-full bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="md:col-span-3">
            <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger className="w-full bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="md:col-span-3">
            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as FilterOptions['type'] }))}
            >
              <SelectTrigger className="w-full bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Platform Filter */}
          <div className="md:col-span-3">
            <Select value={filters.platform} onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value as FilterOptions['platform'] }))}
            >
              <SelectTrigger className="w-full bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="smartlead">SmartLead</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div className="md:col-span-3">
            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as FilterOptions['sortBy'] }))}
            >
              <SelectTrigger className="w-full bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="replyRate">Reply Rate</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (value && value !== 'all') {
              return (
                <Badge 
                  key={key}
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                >
                  {key}: {value}
                  <button className="ml-2 hover:text-blue-300" onClick={() => setFilters(prev => ({ ...prev, [key]: '' }))}
                  >
                    ×
                  </button>
                </Badge>
              )
            }
            return null
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {paginatedTemplates.map((template) => (
          <Card 
            key={template.id}
            className="group hover:shadow-xl transition-all duration-200 bg-gray-800/50 border-gray-700 hover:border-blue-500/50 flex flex-col"
          >
            <CardHeader className="space-y-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">
                  {template.title}
                </CardTitle>
                <Badge 
                  variant={template.type === 'premium' ? 'default' : 'outline'}
                  className={template.type === 'premium' 
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'border-gray-600'
                  }
                >
                  {template.type}
                </Badge>
              </div>
              <CardDescription className="text-gray-400 line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Sparkles className="h-4 w-4" />
                  <span>Score: {template.score}/100</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Building2 className="h-4 w-4" />
                  <span>Industry: {template.industry}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Globe className="h-4 w-4" />
                  <span>Location: {template.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Variable className="h-4 w-4" />
                  <span>Variables: {template.variables.length > 0 ? template.variables.join(', ') : 'No variables'}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-gray-700/50 pt-4">
              <Button
                onClick={() => {
                  setSelectedTemplate(template)
                  setShowTemplateDialog(true)
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100"
              >
                <Mail className="h-4 w-4 mr-2" />
                Preview Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {filteredTemplates.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE)}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {selectedTemplate?.body}
              </pre>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Variables:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate?.variables.map(variable => (
                  <Badge key={variable} variant="outline">
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={() => selectedTemplate && handleCopyTemplate(selectedTemplate)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No templates found</p>
        </div>
      )}
    </div>
  )
} 