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
          <Card key={template.id} className="group bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200 border border-gray-800 hover:border-blue-500/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold group-hover:text-blue-400 transition-colors">
                    {template.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">{template.description}</CardDescription>
                </div>
                <Badge 
                  variant={template.type === 'premium' ? 'default' : 'secondary'}
                  className={`px-3 py-1 ${
                    template.type === 'premium' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {template.type === 'premium' ? 'Pro' : 'FREE'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-600/10 via-blue-600/5 to-transparent rounded-lg p-3 border border-blue-500/20">
                    <p className="text-sm text-blue-300">Reply Rate</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-blue-400">{template.replyRate}%</span>
                      <span className="text-emerald-500 text-sm">↑</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-600/10 via-purple-600/5 to-transparent rounded-lg p-3 border border-purple-500/20">
                    <p className="text-sm text-purple-300">Score</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-purple-400">{template.score}</span>
                      <span className="text-sm text-purple-300">/100</span>
                    </div>
                  </div>
                </div>

                {/* Industry & Platform */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-indigo-400">
                    <Building2 className="w-4 h-4" />
                    {template.industry}
                  </div>
                  <span className="text-gray-600">•</span>
                  <div className="flex items-center gap-1 text-violet-400">
                    <Globe className="w-4 h-4" />
                    <span className="capitalize">{template.platform}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-800/50 pt-4">
              <Button
                onClick={() => {
                  setSelectedTemplate(template)
                  setShowTemplateDialog(true)
                }}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-blue-600 hover:to-indigo-600 text-gray-200 hover:text-white transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 group"
              >
                <Mail className="h-4 w-4 mr-2 group-hover:text-blue-200" />
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
        <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-800">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  {selectedTemplate?.title}
                </DialogTitle>
                <DialogDescription className="text-gray-400 mt-1">
                  {selectedTemplate?.description}
                </DialogDescription>
              </div>
              <Badge 
                variant={selectedTemplate?.type === 'premium' ? 'default' : 'secondary'}
                className="capitalize px-3 py-1"
              >
                {selectedTemplate?.type}
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Template Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-600/10 via-blue-600/5 to-transparent rounded-lg p-4 border border-blue-500/20">
                <p className="text-sm text-blue-300">Reply Rate</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-blue-400">{selectedTemplate?.replyRate}%</span>
                  <span className="text-emerald-500 text-sm">↑</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-600/10 via-indigo-600/5 to-transparent rounded-lg p-4 border border-indigo-500/20">
                <p className="text-sm text-indigo-300">Industry</p>
                <p className="text-lg font-medium text-indigo-400">{selectedTemplate?.industry}</p>
              </div>
              <div className="bg-gradient-to-br from-violet-600/10 via-violet-600/5 to-transparent rounded-lg p-4 border border-violet-500/20">
                <p className="text-sm text-violet-300">Platform</p>
                <p className="text-lg font-medium text-violet-400 capitalize">{selectedTemplate?.platform}</p>
              </div>
            </div>

            {/* Template Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400">Template Content</h3>
                <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                  Score: {selectedTemplate?.score}/100
                </Badge>
              </div>
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
                  {selectedTemplate?.body}
                </pre>
              </div>
            </div>
            
            {/* Variables Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Variables</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate?.variables.map(variable => (
                  <div 
                    key={variable}
                    className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-1 rounded-md text-sm"
                  >
                    {variable}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Section */}
            {selectedTemplate?.tags && selectedTemplate.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-gray-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => selectedTemplate && handleCopyTemplate(selectedTemplate)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Template
              </Button>
              <Button 
                variant="outline" 
                className="px-3 hover:bg-gray-800"
                onClick={() => setShowTemplateDialog(false)}
              >
                Close
              </Button>
            </div>
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