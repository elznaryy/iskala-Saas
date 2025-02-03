'use client'

import { useState, useEffect } from 'react'
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
import { Download, Search, MapPin, Building2, Mail, Users, Globe, Loader2 } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { toast } from 'react-hot-toast'
import { db } from '@/lib/firebase/config'
import { collection, getDocs } from 'firebase/firestore'

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

export default function LeadFinder() {
  const [leads, setLeads] = useState<LeadContainer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    industry: 'all',
    location: 'all',
    verifiedOnly: false
  })
  const [searchTerm, setSearchTerm] = useState('')
  const { userData } = useUser()

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

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.industries.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.locations.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesIndustry = filters.industry === 'all' || 
      lead.industries.includes(filters.industry)
    
    const matchesLocation = filters.location === 'all' || 
      lead.locations.includes(filters.location)
    
    const matchesVerification = !filters.verifiedOnly || 
      lead.hasVerifiedEmails

    return matchesSearch && matchesIndustry && matchesLocation && matchesVerification
  })

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
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative w-full md:w-auto">
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
            {/* Add industry options dynamically */}
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
            {/* Add location options dynamically */}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map(lead => (
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

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No leads found matching your criteria</p>
        </div>
      )}
    </div>
  )
}