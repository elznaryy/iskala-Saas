'use client'

import { useEffect, useState } from 'react'
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { db } from '@/lib/firebase/config'
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore'
import { toast } from 'react-hot-toast'

interface SmartleadUser {
  id: string
  userId: string
  email: string
  name: string
  isVerified: boolean
  createdAt: Date
  status: 'active' | 'suspended' | 'pending'
  basicInfo: {
    email: string
    name: string
    companyName: string
  }
}

export default function SmartleadManagement() {
  const [users, setUsers] = useState<SmartleadUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchSmartleadUsers = async () => {
    try {
      // First get all users
      const usersRef = collection(db, 'Users')
      const usersSnapshot = await getDocs(usersRef)
      
      // Then get smartlead data
      const smartleadRef = collection(db, 'smartlead')
      const smartleadSnapshot = await getDocs(smartleadRef)
      
      const smartleadMap = new Map()
      smartleadSnapshot.docs.forEach(doc => {
        smartleadMap.set(doc.id, doc.data())
      })

      const smartleadUsers = usersSnapshot.docs
        .filter(doc => smartleadMap.has(doc.id) || doc.data().smartlead)
        .map(doc => {
          const userData = doc.data()
          const smartleadData = smartleadMap.get(doc.id) || userData.smartlead
          
          return {
            id: doc.id,
            userId: doc.id,
            email: userData.basicInfo?.email,
            name: userData.basicInfo?.name,
            isVerified: smartleadData?.isVerified || false,
            createdAt: smartleadData?.createdAt?.toDate() || null,
            status: smartleadData?.status || 'pending',
            basicInfo: userData.basicInfo
          }
        })

      setUsers(smartleadUsers)
    } catch (error) {
      console.error('Error fetching smartlead users:', error)
      toast.error('Failed to fetch smartlead users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSmartleadUsers()
  }, [])

  const handleVerificationUpdate = async (userId: string, isVerified: boolean) => {
    try {
      const userRef = doc(db, 'Users', userId)
      await updateDoc(userRef, {
        'smartlead.isVerified': isVerified,
        'smartlead.status': isVerified ? 'active' : 'suspended',
        'smartlead.updatedAt': new Date()
      })
      
      toast.success(`User ${isVerified ? 'verified' : 'unverified'} successfully`)
      fetchSmartleadUsers() // Refresh the list
    } catch (error) {
      console.error('Error updating verification:', error)
      toast.error('Failed to update verification status')
    }
  }

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div>
        <h1 className="text-2xl font-bold">SmartLead Management</h1>
        <p className="text-gray-400">Manage SmartLead account verifications and access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SmartLead Users</CardTitle>
          <CardDescription>
            View and manage SmartLead account access
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
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{user.basicInfo?.companyName}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {user.isVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />
                      )}
                      {user.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.createdAt?.toLocaleDateString() || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={user.isVerified ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleVerificationUpdate(user.id, !user.isVerified)}
                    >
                      {user.isVerified ? 'Revoke Access' : 'Verify Access'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 