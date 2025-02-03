import { UserData } from '@/types/subscription';

const SMARTLEAD_API_KEY = '0c8d14f0-4eb6-40be-a42f-42e3265548e1_69lcnsu';
const SMARTLEAD_API_URL = 'https://server.smartlead.ai/api/v1';

export interface SmartleadClientResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const createSmartleadClient = async (userData: UserData): Promise<SmartleadClientResponse> => {
  try {
    const response = await fetch(`${SMARTLEAD_API_URL}/client/save?api_key=${SMARTLEAD_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.basicInfo.name,
        email: userData.basicInfo.email,
        permission: ['full_access'],
        logo: userData.basicInfo.companyName,
        logo_url: null,
        password: 'iskala123'
      })
    });

    if (!response.ok) {
      throw new Error(`SmartLead API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: response.status === 200,
      message: 'Client created successfully',
      data
    };
  } catch (error) {
    console.error('Error creating SmartLead client:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create SmartLead client'
    };
  }
}; 