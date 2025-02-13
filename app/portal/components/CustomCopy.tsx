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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Email Templates</h1>
      </div>

      <div className="space-y-6">
        {/* Enhanced Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>

          <Select
            value={filters.industry}
            onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Industry" />
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

          <Select
            value={filters.location}
            onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location" />
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

          <Select
            value={filters.sortBy}
            onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              sortBy: value as FilterOptions['sortBy']
            }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="replyRate">Reply Rate</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (value && value !== 'all') {
              return (
                <Badge 
                  key={key}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  {key}: {value}
                  <X 
                    className="ml-2 h-4 w-4 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, [key]: '' }))}
                  />
                </Badge>
              )
            }
            return null
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTemplates.map(template => (
            <Card 
              key={template.id} 
              className={cn(
                "group hover:shadow-lg transition-all",
                !canAccessTemplate(template) && "opacity-80"
              )}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{template.title}</CardTitle>
                  <Badge 
                    variant={template.type === 'premium' ? 'default' : 'outline'}
                    className="capitalize"
                  >
                    {template.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-2">{template.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Score: {template.score}/100</p>
                      <p className="text-sm text-gray-500">Reply Rate: {template.replyRate}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Industry</p>
                      <p className="text-sm text-gray-500">{template.industry}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-gray-500">{template.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Variable className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Variables</p>
                      <p className="text-sm text-gray-500">
                        {template.variables.length > 0 
                          ? template.variables.join(', ')
                          : 'No variables'
                        }
                      </p>
                    </div>
                  </div>

                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="border-t bg-muted/50 p-4">
                {canAccessTemplate(template) ? (
                  <Button 
                    className="w-full"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setShowTemplateDialog(true)
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    View & Copy
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Premium Template",
                        description: "Upgrade your plan to access premium templates",
                        variant: "destructive"
                      })
                    }}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Upgrade Required
                  </Button>
                )}
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
    </div>
  )
} 