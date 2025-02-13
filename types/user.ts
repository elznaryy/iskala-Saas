export interface UserBasicInfo {
  name: string
  email: string
  companyName: string
  phoneNumber: string
}

export interface UserData {
  uid: string
  email: string
  name: string
  basicInfo: UserBasicInfo
  plan: 'free' | 'pro'
  subscription?: {
    status: string
    planId: string
  }
  createdAt: Date
  updatedAt: Date
}
