export interface UserBasicInfo {
  name: string
  email: string
  companyName: string
  phoneNumber: string
  photoURL?: string
}

export interface UserData {
  uid: string
  email: string
  basicInfo: UserBasicInfo
  photoURL?: string
  plan: 'free' | 'pro'
  subscription?: {
    status: string
    planId: string
  }
  createdAt: Date
  updatedAt: Date
}
