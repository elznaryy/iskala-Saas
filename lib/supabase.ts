import { createClient } from '@supabase/supabase-js'
import { auth } from './firebase/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with custom auth
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      get: async () => {
        const user = auth.currentUser
        if (user) {
          const token = await user.getIdToken()
          return {
            Authorization: `Bearer ${token}`
          }
        }
        return {}
      }
    }
  }
})

export type Lead = {
  id: string
  first_name?: string
  last_name?: string
  title?: string
  company_name: string
  email?: string
  primary_email?: string
  primary_email_number?: string
  employee_count?: string
  industry: string
  person_linkedin?: string
  website?: string
  company_linkedin?: string
  country?: string
  total_funding?: string
  secondary_email?: string
  uploaded_at: string
  uploaded_by?: string
  firebase_uid?: string
}

export type LeadFilter = {
  industry?: string[]
  country?: string[]
  employee_count?: string[]
}

export type CSVFileMetadata = {
  accessLevel: 'free' | 'starter' | 'pro'
  originalName: string
  uploadedAt: string
  size: number
} 