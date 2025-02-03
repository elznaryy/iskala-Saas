export interface UserData {
  uid: string
  email?: string
  name?: string
  plan?: 'free' | 'starter' | 'pro'
  subscription?: {
    planId: string
    status: string
  }
  // ... other user properties
}
