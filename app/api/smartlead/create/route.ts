import { NextResponse } from 'next/server'

const SMARTLEAD_API_KEY = '0c8d14f0-4eb6-40be-a42f-42e3265548e1_69lcnsu'
const SMARTLEAD_API_URL = 'https://server.smartlead.ai/api/v1'

interface SmartleadRequest {
  name: string
  email: string
  permission: string[]
  logo: string
  logo_url: null
  password: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Prepare request body with required format
    const smartleadBody: SmartleadRequest = {
      name: body.name,
      email: body.email,
      permission: ["full_access"], // Ensure this is exactly as required
      logo: body.logo || body.companyName,
      logo_url: null,
      password: body.password
    }

    // Call SmartLead API
    const response = await fetch(`${SMARTLEAD_API_URL}/client/save?api_key=${SMARTLEAD_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smartleadBody)
    })

    // Get response text first
    const responseText = await response.text()
    let responseData;

    // Try to parse as JSON if possible
    try {
      responseData = JSON.parse(responseText)
    } catch {
      // If not JSON, use the text as error message
      responseData = { message: responseText }
    }

    // Special case: If we get a permission error but the client might have been created
    if (!response.ok && response.status === 403) {
      // Verify if client exists by trying to fetch it
      const verifyResponse = await fetch(`${SMARTLEAD_API_URL}/client/list?api_key=${SMARTLEAD_API_KEY}`)
      const clients = await verifyResponse.json()
      
      // Check if our client exists in the list
      const clientExists = clients.some((client: any) => client.email === body.email)
      
      if (clientExists) {
        // Client was actually created despite the error
        return NextResponse.json({
          success: true,
          data: {
            message: 'Client created successfully (despite permission warning)',
            email: body.email,
            name: body.name,
            permission: ["full_access"]
          }
        })
      }
    }

    // If we got here and response was not ok, it's a real error
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to create SmartLead client')
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Error creating SmartLead client:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create SmartLead client' 
      },
      { status: 500 }
    )
  }
} 