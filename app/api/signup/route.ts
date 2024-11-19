import { NextResponse } from 'next/server';

const SMARTLEAD_API_KEY = "33d095ab-79e0-4121-83ed-9191e9e0c6d0_fkcrn5o"; // Replace with your actual API key

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, permission, logo, logo_url } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { status: 'error', message: 'Missing required fields' }, 
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://server.smartlead.ai/api/v1/client/save?api_key=${SMARTLEAD_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          permission,
          logo,
          logo_url
        }),
      }
    );

    const data = await response.json();
    
    if (data.message?.includes('already exist')) {
      return NextResponse.json({
        status: 'exists',
        message: 'This email is already registered. Please sign in to continue.',
      }, { status: 409 });
    }

    if (data.ok && data.clientId) {
      return NextResponse.json({
        status: 'success',
        message: 'Account created successfully!',
        data: {
          clientId: data.clientId,
          name: data.name,
          email: data.email
        }
      }, { status: 200 });
    }

    return NextResponse.json({
      status: 'error',
      message: data.message || 'An error occurred during signup'
    }, { status: 400 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Internal Server Error'
    }, { status: 500 });
  }
}
