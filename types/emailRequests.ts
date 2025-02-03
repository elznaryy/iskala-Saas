export interface EmailRequest {
  id: string;
  userId: string;
  provider: 'google' | 'outlook' | 'smtp';
  numberOfAccounts: number;
  names: string;
  profilePhotoUrl: string;
  domainProviderLink: string;
  domains: string;
  status: 'pending' | 'active' | 'rejected' | 'in_progress';
  createdAt: Date;
  updatedAt: Date;
}