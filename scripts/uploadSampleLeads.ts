import { realtimeDb } from '../lib/firebase/config';
import { ref, set } from 'firebase/database';
import { Lead } from '@/types/leads';

const sampleLeads: Lead[] = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john@company.com",
    phoneNumber: "+1234567890",
    companyName: "Tech Corp",
    website: "techcorp.com",
    title: "CEO",
    domain: "techcorp.com",
    industry: "Technology",
    keywords: "software,tech,startup",
    numberOfEmployees: "50",
    searchText: "john doe tech corp ceo technology"
  }
  // Add more sample data as needed
];

async function uploadSampleData() {
  try {
    const leadsRef = ref(realtimeDb, 'leads');
    await set(leadsRef, null); // Clear existing data
    
    // Create an object to store leads with unique keys
    const leadsData: { [key: string]: Lead } = {};
    
    sampleLeads.forEach((lead, index) => {
      const leadId = `lead_${Date.now()}_${index}`;
      leadsData[leadId] = {
        ...lead,
        searchText: `${lead.firstName} ${lead.lastName} ${lead.companyName} ${lead.title} ${lead.industry}`.toLowerCase()
      };
    });

    await set(leadsRef, leadsData);
    console.log('Sample data uploaded successfully');
  } catch (error) {
    console.error('Error uploading sample data:', error);
  }
}

uploadSampleData(); 