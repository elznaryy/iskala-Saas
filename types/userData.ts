export interface UserData {
  uid: string
  email: string
  plan: 'free' | 'pro'
  name?: string
  companyName?: string
  photoURL?: string
  createdAt?: Date
  subscription?: {
    planId: string
    status: string
  }
} 