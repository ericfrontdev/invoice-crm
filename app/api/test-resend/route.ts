import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM

    if (!resendApiKey) {
      return NextResponse.json({
        error: 'RESEND_API_KEY not found',
      }, { status: 500 })
    }

    // Tester l'API Resend - récupérer les domaines
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
      }
    })

    const data = await response.json()

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      hasApiKey: !!resendApiKey,
      apiKeyPrefix: resendApiKey.substring(0, 10) + '...',
      emailFrom: emailFrom,
      resendResponse: data,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Exception occurred',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
