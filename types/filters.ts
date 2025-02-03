export interface LeadFilter {
  id?: string
  name: string
  regions: string[]
  companySizes: string[]
  industries: string[]
  userId: string
  createdAt: Date
}

export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001-10000',
  '10000+'
]

export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Construction',
  'Transportation',
  'Energy',
  'Agriculture',
  'Entertainment',
  'Media',
  'Telecommunications',
  'Professional Services',
  'Hospitality',
  'Non-Profit',
  'Government',
  // Add more industries as needed
]

export const REGIONS = [
  'North America',
  'South America',
  'Europe',
  'Asia',
  'Africa',
  'Oceania',
  'Middle East'
  // You can expand this with specific countries
] 