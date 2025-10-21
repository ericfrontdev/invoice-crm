import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Vérifier que la clé Stripe Client ID est configurée
    if (!process.env.STRIPE_CLIENT_ID) {
      console.error('[stripe-connect] STRIPE_CLIENT_ID not configured')
      return NextResponse.json(
        { error: 'Stripe Connect n\'est pas configuré. Veuillez contacter l\'administrateur.' },
        { status: 500 }
      )
    }

    // Construire l'URL OAuth de Stripe
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/stripe/callback`

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.STRIPE_CLIENT_ID,
      scope: 'read_write',
      redirect_uri: redirectUri,
      state: session.user.id, // On passe l'ID utilisateur pour le récupérer dans le callback
    })

    const oauthUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`

    console.log('[stripe-connect] Redirecting to Stripe OAuth:', {
      userId: session.user.id,
      redirectUri,
    })

    return NextResponse.redirect(oauthUrl)
  } catch (error) {
    console.error('[stripe-connect] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion à Stripe' },
      { status: 500 }
    )
  }
}
