import { NextResponse } from 'next/server'

const ZOHO_WEBHOOK_URL = 'https://flow.zoho.com/849281392/flow/webhook/incoming?zapikey=1001.c7d89d205781e040ed31742457138bf8.189c590d02eb4e16d06c3d5d643e7e61&isdebug=false'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const response = await fetch(ZOHO_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to submit to Zoho')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error forwarding to Zoho:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 