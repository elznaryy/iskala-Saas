import { ref, push, query, orderByChild, startAt, endAt, get, set } from 'firebase/database';
import { realtimeDb } from './config';
import { Lead } from '@/types/leads';

// Upload multiple leads
export const uploadLeadsToFirebase = async (leads: Lead[]) => {
  const leadsRef = ref(realtimeDb, 'leads');
  
  console.log('Starting Firebase upload with leads:', leads);
  
  try {
    // Get existing leads
    const snapshot = await get(leadsRef);
    const existingLeads = snapshot.val() || {};
    
    // Create updates object with new leads
    const updates: { [key: string]: Lead } = { ...existingLeads };
    
    leads.forEach((lead) => {
      const newLeadRef = push(leadsRef);
      const leadId = newLeadRef.key;
      if (leadId) {
        updates[leadId] = {
          ...lead,
          searchText: `${lead.firstName} ${lead.lastName} ${lead.companyName}`.toLowerCase()
        };
      }
    });

    // Perform the update
    await set(leadsRef, updates);
    console.log('Firebase upload successful');
    return true;
  } catch (error) {
    console.error('Firebase upload error:', error);
    throw error;
  }
};

// Search leads
export const searchLeads = async (searchTerm: string = ''): Promise<Lead[]> => {
  const leadsRef = ref(realtimeDb, 'leads');
  
  if (!searchTerm) {
    const snapshot = await get(leadsRef);
    return Object.values(snapshot.val() || {}) as Lead[];
  }

  const q = query(
    leadsRef,
    orderByChild('searchText'),
    startAt(searchTerm.toLowerCase()),
    endAt(searchTerm.toLowerCase() + '\uf8ff')
  );

  const snapshot = await get(q);
  return Object.values(snapshot.val() || {}) as Lead[];
};

// Get leads with pagination
export const getLeads = async (page: number = 1, limit: number = 10) => {
  const leadsRef = ref(realtimeDb, 'leads');
  const snapshot = await get(leadsRef);
  const leads = Object.values(snapshot.val() || {}) as Lead[];
  
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    leads: leads.slice(start, end),
    total: leads.length,
    hasMore: end < leads.length
  };
}; 