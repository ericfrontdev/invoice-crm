import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { invoiceId } = body

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId requis' }, { status: 400 })
    }

    // Récupérer la facture
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            user: {
              select: {
                stripeAccountId: true,
                paymentProvider: true,
              },
            },
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Facture déjà payée' }, { status: 400 })
    }

    if (invoice.client.user.paymentProvider !== 'stripe') {
      return NextResponse.json(
        { error: 'Stripe non configuré pour ce compte' },
        { status: 400 }
      )
    }

    if (!invoice.client.user.stripeAccountId) {
      return NextResponse.json(
        { error: 'ID de compte Stripe manquant' },
        { status: 400 }
      )
    }

    // Vérifier que la clé secrète Stripe est configurée
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[create-stripe-session] STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Stripe n\'est pas configuré sur le serveur. Veuillez contacter l\'administrateur.' },
        { status: 500 }
      )
    }

    // Initialiser Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })

    // Calculer la commission de la plateforme (optionnel)
    // Vous pouvez configurer une commission via une variable d'environnement
    // Par exemple: STRIPE_APPLICATION_FEE_PERCENT=2 pour 2%
    const applicationFeePercent = parseFloat(process.env.STRIPE_APPLICATION_FEE_PERCENT || '0')
    const applicationFeeAmount = Math.round(invoice.total * 100 * (applicationFeePercent / 100))

    console.log('[create-stripe-session] Creating session with destination charge:', {
      destinationAccount: invoice.client.user.stripeAccountId,
      totalAmount: Math.round(invoice.total * 100),
      applicationFee: applicationFeeAmount,
      feePercent: applicationFeePercent,
    })

    // Créer une session de paiement avec Stripe Connect (Destination Charges)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `Facture ${invoice.number}`,
              description: `Paiement de la facture ${invoice.number}`,
            },
            unit_amount: Math.round(invoice.total * 100), // Convertir en cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/invoices/${invoice.id}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/invoices/${invoice.id}/pay`,
      customer_email: invoice.client.email,
      metadata: {
        invoiceId: invoice.id,
      },
      // Stripe Connect: Destination Charges
      // L'argent va directement sur le compte du solopreneur
      // La plateforme peut optionnellement prendre une commission
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: invoice.client.user.stripeAccountId,
        },
      },
    })

    console.log('[create-stripe-session] Session created:', session.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[create-stripe-session] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement', details: errorMessage },
      { status: 500 }
    )
  }
}
