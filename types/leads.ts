export interface Lead {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  website: string;
  title: string;
  domain: string;
  industry: string;
  keywords: string;
  numberOfEmployees: string;
  region: string;
  searchText?: string;
}

export interface ExportLimits {
  dailyLimit: number;
  totalLimit: number | null; // null for unlimited
  currentDayExports: number;
  totalExports: number;
  lastExportDate: Date;
}

export interface FilterOptions {
  industry?: string[];
  title?: string[];
  numberOfEmployees?: {
    min?: number;
    max?: number;
  };
  domain?: string[];
  keywords?: string[];
} 