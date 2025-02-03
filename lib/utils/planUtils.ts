import { PlanType, PLAN_LIMITS } from '@/types/subscription'

export const PLAN_IDS = {
  '1': 'free',
  '3': 'pro',
  'free': 'free',
  'pro': 'pro'
} as const

export const getPlanFromId = (planId: string): PlanType => {
  if (planId === '1' || planId === 'free') return 'free'
  if (planId === '3' || planId === 'pro') return 'pro'
  return 'free'
}

export const checkEmailLimit = (currentUsage: number, plan: PlanType): boolean => {
  return currentUsage < PLAN_LIMITS[plan].aiEmailLimit
}

export const checkLeadsLimit = (currentLeads: number, plan: PlanType): boolean => {
  return currentLeads < PLAN_LIMITS[plan].leadsLimit
}

export const hasSmartLeadAccess = (plan: PlanType): boolean => {
  return PLAN_LIMITS[plan].smartleadLimit > 0
}

export const hasLMSAccess = (plan: PlanType): boolean => {
  return PLAN_LIMITS[plan]?.hasLMSAccess || false
}

export const getRemainingEmails = (currentUsage: number, plan: PlanType): number => {
  const limit = getEmailLimit(plan)
  return limit - currentUsage
}

export const getRemainingLeads = (currentLeads: number, plan: PlanType): number => {
  return PLAN_LIMITS[plan].leadsLimit - currentLeads
}

export const isFreePlan = (planId: string) => planId === "1"

export const getPlanName = (planId: string) => {
  switch (planId) {
    case "1":
      return "Free"
    case "3":
      return "Pro"
    default:
      return "Free"
  }
}

export const hasSmartleadAccess = (plan: PlanType): boolean => {
  return PLAN_LIMITS[plan].smartleadLimit > 0
}

export const getEmailLimit = (plan: PlanType): number => {
  return PLAN_LIMITS[plan].aiEmailLimit || 30
}