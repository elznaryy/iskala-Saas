import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { fullName, email, password } = await req.json();

  console.log('API Key:', process.env.SMARTLEAD_API_KEY ? 'Present' : 'Missing');

  if (!process.env.SMARTLEAD_API_KEY) {
    console.error('SMARTLEAD_API_KEY is not defined in environment variables');
    return NextResponse.json(
      { error: 'API key not configured' }, 
      { status: 500 }
    );
  }

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { error: 'Missing required fields' }, 
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://server.smartlead.ai/api/v1/client/save?api_key=${process.env.SMARTLEAD_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          permission: ['reply_master_inbox'],
          logo: 'SmartGen Outreach',
          logo_url: null,
        }),
      }
    );

    const data = await response.json();
    
    console.log('SmartLead API Response:', {
      status: response.status,
      data: data
    });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
