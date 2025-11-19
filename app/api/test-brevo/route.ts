import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY
    const brevoListId = process.env.BREVO_WAITLIST_ID

    // Vérifier si les variables existent
    if (!brevoApiKey) {
      return NextResponse.json({
        error: 'BREVO_API_KEY not found',
        env: process.env.NODE_ENV,
      }, { status: 500 })
    }

    // Tester l'API Brevo - récupérer les listes
    const response = await fetch('https://api.brevo.com/v3/contacts/lists', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
      }
    })

    const data = await response.json()

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      hasApiKey: !!brevoApiKey,
      apiKeyPrefix: brevoApiKey.substring(0, 20) + '...',
      listId: brevoListId,
      brevoResponse: data,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Exception occurred',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
