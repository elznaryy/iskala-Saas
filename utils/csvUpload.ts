import { Lead } from '@/types/leads';

export const parseCSV = (csvText: string): Lead[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const lead: any = {};
    
    headers.forEach((header, index) => {
      lead[header] = values[index] || '';
    });

    // Add searchText
    lead.searchText = `${lead.firstName} ${lead.lastName} ${lead.companyName} ${lead.title} ${lead.industry}`.toLowerCase();
    
    return lead as Lead;
  });
}; 