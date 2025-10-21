import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import Stripe from 'stripe'

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

    // TODO: Implémenter l'intégration Stripe
    // Pour l'instant, retourner une erreur indiquant que Stripe doit être configuré
    return NextResponse.json(
      {
        error:
          'L\'intégration Stripe nécessite une configuration supplémentaire. Veuillez installer le package Stripe et configurer vos clés API.',
      },
      { status: 501 }
    )

    /*
    // Initialiser Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-11-20.acacia',
    })

    // Créer une session de paiement
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
      metadata: {
        invoiceId: invoice.id,
      },
      payment_intent_data: {
        application_fee_amount: 0,
        transfer_data: {
          destination: invoice.client.user.stripeAccountId,
        },
      },
    })

    return NextResponse.json({ url: session.url })
    */
  } catch (error) {
    console.error('[create-stripe-session] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}
