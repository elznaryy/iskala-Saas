'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase/config'
import { UserData, PlanType } from '@/types/subscription'

interface UserContextType {
  userData: UserData | null
  loading: boolean
  refreshUserData: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  userData: null,
  loading: true,
  refreshUserData: async () => {}
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = async (userId: string) => {
    console.log('Fetching user data for:', userId)
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      console.log('User doc exists:', userDoc.exists())
      
      if (userDoc.exists()) {
        const data = userDoc.data()
        console.log('Raw user data:', data)

        const userData: UserData = {
          uid: userId,
          email: data.email || null,
          name: data.basicInfo?.name || data.name || '',
          photoURL: data.basicInfo?.photoURL || data.photoURL || '',
          plan: (data.plan?.toLowerCase() as PlanType) || 'free',
          basicInfo: {
            name: data.basicInfo?.name || '',
            email: data.basicInfo?.email || '',
            companyName: data.basicInfo?.companyName || '',
            phoneNumber: data.basicInfo?.phoneNumber || ''
          },
          subscription: data.subscription ? {
            planId: data.subscription.planId || '1',
            status: data.subscription.status?.toLowerCase() || 'active',
            nextBillingDate: data.subscription.nextBillingDate?.toDate() || undefined
          } : undefined
        }

        console.log('Processed user data:', userData)
        return userData
      }
      return null
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  const refreshUserData = async () => {
    console.log('Refreshing user data')
    if (auth.currentUser?.uid) {
      const freshData = await fetchUserData(auth.currentUser.uid)
      if (freshData) {
        setUserData(freshData)
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const data = await fetchUserData(user.uid)
          setUserData(data)
          const token = await user.getIdToken(true)
          document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Strict`
        } else {
          setUserData(null)
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
      } catch (error) {
        console.error('Error in auth state change:', error)
        setUserData(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ userData, loading, refreshUserData }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)