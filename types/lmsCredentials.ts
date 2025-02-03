export interface LMSCredentials {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  password: string
  companyName: string
  submittedAt: any
  createdAt: any
  status: 'pending' | 'active' | 'rejected'
} 