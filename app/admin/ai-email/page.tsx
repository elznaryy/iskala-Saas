'use client'

import { useState, useEffect } from 'react'
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, Users, BarChart } from "lucide-react"
import { db } from '@/lib/firebase/config'
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UserUsage {
  userId: string
  email: string
  name: string
  count: number
  plan: string
  lastResetDate: Date
  updatedAt: Date
}

export default function AiEmailAnalytics() {
  const [usageData, setUsageData] = useState<UserUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalUsage, setTotalUsage] = useState(0)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [userToReset, setUserToReset] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch usage data
      const usageRef = collection(db, 'aiEmailUsage')
      const usageSnapshot = await getDocs(usageRef)
      
      // Fetch user data to get names and emails
      const usersRef = collection(db, 'Users')
      const usersSnapshot = await getDocs(usersRef)
      const usersMap = new Map()
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data()
        usersMap.set(doc.id, {
          email: data.basicInfo?.email,
          name: data.basicInfo?.name,
          plan: data.plan || 'free'
        })
      })
      
      const usage: UserUsage[] = []
      let total = 0
      
      usageSnapshot.docs.forEach(doc => {
        const data = doc.data()
        const userData = usersMap.get(doc.id)
        total += data.count || 0
        
        usage.push({
          userId: doc.id,
          email: userData?.email || 'Unknown',
          name: userData?.name || 'Unknown',
          count: data.count || 0,
          plan: userData?.plan || 'free',
          lastResetDate: data.lastResetDate?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        })
      })
      
      setUsageData(usage)
      setTotalUsage(total)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (userId: string) => {
    try {
      const userRef = doc(db, 'aiEmailUsage', userId)
      await updateDoc(userRef, {
        count: 0,
        lastResetDate: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      
      toast.success('Usage reset successfully')
      fetchData()
      setResetDialogOpen(false)
    } catch (error) {
      console.error('Error resetting usage:', error)
      toast.error('Failed to reset usage')
    }
  }

  const filteredUsers = usageData.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AI Email Analytics</h1>
          <p className="text-gray-400">Monitor AI email usage per user</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Prompts"
          value={totalUsage}
          description="All time usage"
          icon={BarChart}
        />
        <StatsCard
          title="Active Users"
          value={usageData.length}
          description="Users with usage data"
          icon={Users}
        />
        <StatsCard
          title="Avg. Per User"
          value={Math.round(totalUsage / (usageData.length || 1))}
          description="Average prompts per user"
          icon={RefreshCw}
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Usage</CardTitle>
          <CardDescription>
            Monitor and manage user AI email usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Last Reset</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{user.plan}</span>
                  </TableCell>
                  <TableCell>{user.count}</TableCell>
                  <TableCell>
                    {user.lastResetDate?.toLocaleDateString() || 'Never'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUserToReset(user.userId)
                        setResetDialogOpen(true)
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Usage Count</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset this user's usage count to 0? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToReset && handleReset(userToReset)}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StatsCard({ title, value, description, icon: Icon }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
} 