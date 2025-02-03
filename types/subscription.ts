export type PlanType = 'free' | 'pro';

export interface Subscription {
  planId: string;
  status: string;
  nextBillingDate?: Date;
}

export interface UserData {
  uid: string;
  email: string | null;
  name: string;
  photoURL?: string;
  plan: PlanType;
  basicInfo: {
    name: string;
    email: string;
    companyName: string;
    phoneNumber: string;
  };
  subscription?: Subscription;
}

export interface PlanLimits {
  aiEmailLimit: number;
  smartleadLimit: number;
  hasLMSAccess: boolean;
  leadsLimit: number;
}

export const PLAN_LIMITS = {
  free: {
    aiEmailLimit: 30,
    smartleadLimit: 0,
    hasLMSAccess: false,
    leadsLimit: 500
  },
  pro: {
    aiEmailLimit: 300,
    smartleadLimit: Number.MAX_SAFE_INTEGER,
    hasLMSAccess: true,
    leadsLimit: 10000
  }
};