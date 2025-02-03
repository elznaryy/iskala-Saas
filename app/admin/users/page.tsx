'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from 'react-hot-toast'
import { db, auth } from '@/lib/firebase/config'
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp,
  where,
  orderBy,
  addDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore'
import { 
  createUserWithEmailAndPassword, 
  updateEmail, 
  updatePassword,
  signInWithEmailAndPassword,
  deleteUser as deleteAuthUser
} from 'firebase/auth'
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  Shield, 
  Mail 
} from 'lucide-react'
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

interface UserData {
  uid: string
  email: string
  basicInfo: {
    name: string
    email: string
    companyName?: string
    phoneNumber?: string
  }
  plan: 'free' | 'pro'
  subscription?: {
    status: string
    planId: string
  }
  createdAt: Date
  updatedAt: Date
}

interface UserFormData {
  email: string
  password: string
  name: string
  companyName: string
  phoneNumber: string
  plan: 'free' | 'pro'
}

const initialFormData: UserFormData = {
  email: '',
  password: '',
  name: '',
  companyName: '',
  phoneNumber: '',
  plan: 'free'
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<UserFormData>(initialFormData)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users')
      const usersQuery = query(usersRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(usersQuery)
      
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as UserData[]

      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Store current admin credentials
      const currentAdmin = auth.currentUser
      if (!currentAdmin?.email) throw new Error('Admin authentication required')
      
      // Create new user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )

      // Create user document
      const userData = {
        uid: userCredential.user.uid,
        email: formData.email,
        basicInfo: {
          name: formData.name,
          email: formData.email,
          companyName: formData.companyName,
          phoneNumber: formData.phoneNumber
        },
        plan: formData.plan,
        subscription: {
          status: formData.plan,
          planId: formData.plan === 'pro' ? '2' : '1'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), userData)

      // Sign back in as admin
      await signInWithEmailAndPassword(auth, currentAdmin.email, currentAdmin.email)

      toast.success('User created successfully')
      setIsDialogOpen(false)
      setFormData(initialFormData)
      fetchUsers()
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast.error(error.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setLoading(true)
    try {
      const userRef = doc(db, 'users', editingUser.uid)
      
      const updates = {
        basicInfo: {
          name: formData.name,
          email: formData.email,
          companyName: formData.companyName,
          phoneNumber: formData.phoneNumber
        },
        plan: formData.plan,
        subscription: {
          status: formData.plan,
          planId: formData.plan === 'pro' ? '2' : '1'
        },
        updatedAt: serverTimestamp()
      }

      await updateDoc(userRef, updates)

      if (formData.email !== editingUser.email) {
        await updateEmail(auth.currentUser!, formData.email)
      }

      if (formData.password) {
        await updatePassword(auth.currentUser!, formData.password)
      }

      toast.success('User updated successfully')
      setIsDialogOpen(false)
      setEditingUser(null)
      setFormData(initialFormData)
      fetchUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error(error.message || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: UserData) => {
    setEditingUser(user)
    setFormData({
      email: user.basicInfo.email,
      password: '',
      name: user.basicInfo.name,
      companyName: user.basicInfo.companyName || '',
      phoneNumber: user.basicInfo.phoneNumber || '',
      plan: user.plan
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (user: UserData) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    setLoading(true)
    try {
      // First delete the user's authentication using the API
      const response = await fetch(`/api/admin?uid=${userToDelete.uid}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user authentication')
      }

      // Then delete the user document from Firestore
      try {
        await deleteDoc(doc(db, 'users', userToDelete.uid))
      } catch (firestoreError) {
        console.error('Error deleting user document:', firestoreError)
        // Continue even if Firestore deletion fails
      }

      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Failed to delete user')
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.basicInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.basicInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.basicInfo.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPlan = planFilter === 'all' || user.plan === planFilter

    return matchesSearch && matchesPlan
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-gray-400">Manage your application users</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Create New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user details' : 'Add a new user to the system'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">
                    Password {editingUser && '(leave blank to keep unchanged)'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required={!editingUser}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="plan">Plan</Label>
                  <Select
                    value={formData.plan}
                    onValueChange={(value: 'free' | 'pro') => 
                      setFormData(prev => ({ ...prev, plan: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : editingUser ? 'Update User' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={planFilter}
          onValueChange={setPlanFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Total users: {users.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.basicInfo.name}</p>
                      <p className="text-sm text-gray-500">{user.basicInfo.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{user.basicInfo.companyName || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.plan === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.plan.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.createdAt?.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast.success('Email feature coming soon')
                        }}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              {userToDelete && ` ${userToDelete.basicInfo.name}`} and all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 