import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // userId
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Vérifier s'il y a une erreur de Stripe
    if (error) {
      console.error('[stripe-callback] OAuth error:', error, errorDescription)
      const errorUrl = new URL('/profil', req.url)
      errorUrl.searchParams.set('stripe_error', errorDescription || error)
      return NextResponse.redirect(errorUrl)
    }

    if (!code) {
      console.error('[stripe-callback] No authorization code received')
      return NextResponse.redirect(new URL('/profil?stripe_error=no_code', req.url))
    }

    if (!state) {
      console.error('[stripe-callback] No state (userId) received')
      return NextResponse.redirect(new URL('/profil?stripe_error=no_state', req.url))
    }

    // Vérifier que les clés Stripe sont configurées
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[stripe-callback] STRIPE_SECRET_KEY not configured')
      return NextResponse.redirect(new URL('/profil?stripe_error=not_configured', req.url))
    }

    console.log('[stripe-callback] Exchanging code for account ID, userId:', state)

    // Initialiser Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })

    // Échanger le code d'autorisation contre un token d'accès
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })

    const stripeAccountId = response.stripe_user_id

    if (!stripeAccountId) {
      console.error('[stripe-callback] No stripe_user_id in response')
      return NextResponse.redirect(new URL('/profil?stripe_error=no_account_id', req.url))
    }

    console.log('[stripe-callback] Received Stripe account ID:', stripeAccountId)

    // Mettre à jour l'utilisateur dans la base de données
    await prisma.user.update({
      where: { id: state },
      data: {
        stripeAccountId,
        paymentProvider: 'stripe',
      },
    })

    console.log('[stripe-callback] User updated successfully')

    // Rediriger vers la page de profil avec un message de succès
    return NextResponse.redirect(new URL('/profil?stripe_connected=true', req.url))
  } catch (error) {
    console.error('[stripe-callback] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'unknown_error'
    return NextResponse.redirect(new URL(`/profil?stripe_error=${encodeURIComponent(errorMessage)}`, req.url))
  }
}
