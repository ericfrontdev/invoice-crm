import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    // Vérifier que les clés Stripe sont configurées
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[stripe-webhook] STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Stripe webhook secret not configured' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })

    const sig = req.headers.get('stripe-signature')

    if (!sig) {
      console.error('[stripe-webhook] No signature header')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('[stripe-webhook] Webhook signature verification failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json(
        { error: 'Invalid signature', details: errorMessage },
        { status: 400 }
      )
    }

    console.log('[stripe-webhook] Event received:', event.type)

    // Gérer l'événement checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const invoiceId = session.metadata?.invoiceId

      if (!invoiceId) {
        console.error('[stripe-webhook] No invoice ID in session metadata')
        return NextResponse.json({ error: 'No invoice ID' }, { status: 400 })
      }

      console.log('[stripe-webhook] Processing payment for invoice:', invoiceId)

      // Récupérer la facture
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      })

      if (!invoice) {
        console.error('[stripe-webhook] Invoice not found:', invoiceId)
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }

      // Vérifier que la facture n'est pas déjà payée
      if (invoice.status === 'paid') {
        console.log('[stripe-webhook] Invoice already paid:', invoiceId)
        return NextResponse.json({ received: true, message: 'Already paid' })
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
  } catch (error) {
    console.error('[stripe-webhook] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
