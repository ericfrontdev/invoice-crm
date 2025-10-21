import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    // TODO: Implémenter la vérification de signature Stripe
    // Pour l'instant, on retourne une erreur indiquant que Stripe doit être configuré
    console.log('[stripe-webhook] Webhook received but Stripe is not configured')

    return NextResponse.json(
      {
        error:
          'L\'intégration Stripe nécessite une configuration supplémentaire. Veuillez installer le package Stripe et configurer vos clés API.',
      },
      { status: 501 }
    )

    /*
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-11-20.acacia',
    })

    const sig = req.headers.get('stripe-signature')

    if (!sig) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('[stripe-webhook] Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Gérer l'événement checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const invoiceId = session.metadata?.invoiceId

      if (!invoiceId) {
        console.error('[stripe-webhook] No invoice ID in session metadata')
        return NextResponse.json({ error: 'No invoice ID' }, { status: 400 })
      }

      // Récupérer la facture
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      })

      if (!invoice) {
        console.error('[stripe-webhook] Invoice not found:', invoiceId)
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }

      // Mettre à jour la facture
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'paid',
          paidAt: new Date(),
          paymentProvider: 'stripe',
          paymentTransactionId: session.payment_intent as string,
        },
      })

      // Marquer les unpaidAmounts comme payés
      await prisma.unpaidAmount.updateMany({
        where: { invoiceId },
        data: { status: 'paid' },
      })

      console.log('[stripe-webhook] Invoice updated successfully:', invoiceId)
    }

    return NextResponse.json({ received: true })
    */
  } catch (error) {
    console.error('[stripe-webhook] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
