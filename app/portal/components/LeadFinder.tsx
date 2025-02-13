'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Download, Search, MapPin, Building2, Mail, Users, Globe, Loader2, X } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { toast } from 'react-hot-toast'
import { db } from '@/lib/firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import { cn } from '@/lib/utils'

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

interface FilterOptions {
  industry: string | 'all'
  location: string | 'all'
  planType: 'all' | 'free' | 'pro'
  verifiedOnly: boolean
  sortBy: 'leadCount' | 'date' | 'name'
}

export default function LeadFinder() {
  const [leads, setLeads] = useState<LeadContainer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({
    industry: 'all',
    location: 'all',
    planType: 'all',
    verifiedOnly: false,
    sortBy: 'leadCount'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 9
  const { userData } = useUser()

  // Get unique industries and locations
  const industries = useMemo(() => 
    [...new Set(leads.flatMap(lead => lead.industries))],
    [leads]
  )
  
  const locations = useMemo(() => 
    [...new Set(leads.flatMap(lead => lead.locations))],
    [leads]
  )

  // Enhanced filtering with useMemo
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.industries.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.locations.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesIndustry = filters.industry === 'all' || 
        lead.industries.includes(filters.industry)
      
      const matchesLocation = filters.location === 'all' || 
        lead.locations.includes(filters.location)
      
      const matchesPlanType = filters.planType === 'all' || 
        lead.planType === filters.planType
      
      const matchesVerification = !filters.verifiedOnly || 
        lead.hasVerifiedEmails

      return matchesSearch && matchesIndustry && 
             matchesLocation && matchesPlanType && 
             matchesVerification
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'leadCount':
          return b.leadCount - a.leadCount
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  }, [leads, searchTerm, filters])

  // Pagination
  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filteredLeads.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredLeads, page])

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

  const canAccessLead = (lead: LeadContainer) => {
    const userPlan = userData?.plan || 'free'
    return userPlan === 'pro' || lead.planType === 'free'
  }

  const handleDownload = async (lead: LeadContainer) => {
    if (!canAccessLead(lead)) {
      toast.error(`This lead pack requires ${lead.planType === 'pro' ? 'Pro' : 'Free'} plan or higher`)
      return
    }

    try {
      window.open(lead.downloadUrl, '_blank')
      toast.success('Download started')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lead Finder</h1>
        <p className="text-gray-500">
          Explore and download verified leads for your business
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        
        <Select
          value={filters.industry}
          onValueChange={(value) => setFilters(prev => ({...prev, industry: value}))}
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
          onValueChange={(value) => setFilters(prev => ({...prev, location: value}))}
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
            <SelectItem value="leadCount">Lead Count</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setFilters(prev => ({
            ...prev,
            verifiedOnly: !prev.verifiedOnly
          }))}
          className={cn(
            "whitespace-nowrap",
            filters.verifiedOnly && "bg-blue-100 border-blue-500"
          )}
        >
          <Mail className="w-4 h-4 mr-2" />
          Verified Only
        </Button>
      </div>

      {/* Active Filters Display */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(filters).map(([key, value]) => {
          if ((value !== 'all' && value !== false) || (key === 'verifiedOnly' && value)) {
            return (
              <Badge 
                key={key}
                variant="secondary"
                className="px-3 py-1"
              >
                {key === 'verifiedOnly' ? 'Verified Only' : `${key}: ${value}`}
                <X 
                  className="ml-2 h-4 w-4 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    [key]: key === 'verifiedOnly' ? false : 'all'
                  }))}
                />
              </Badge>
            )
          }
          return null
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedLeads.map(lead => (
          <Card key={lead.id} className="group hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{lead.name}</CardTitle>
                <Badge 
                  variant={lead.planType === 'pro' ? 'default' : 'outline'}
                  className="capitalize"
                >
                  {lead.planType === 'pro' ? 'Pro' : 'Free'}
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
            <CardFooter className="border-t bg-muted/50 p-4">
              <Button 
                variant={canAccessLead(lead) ? "default" : "outline"}
                className="w-full h-9"
                onClick={() => handleDownload(lead)}
                disabled={!canAccessLead(lead)}
              >
                <Download className="h-4 w-4 mr-2" />
                {canAccessLead(lead) ? 'Download Now' : 'Upgrade Required'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {filteredLeads.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {Math.ceil(filteredLeads.length / ITEMS_PER_PAGE)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(filteredLeads.length / ITEMS_PER_PAGE)}
          >
            Next
          </Button>
        </div>
      )}

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No leads found matching your criteria</p>
        </div>
      )}
    </div>
  )
}