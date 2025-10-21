import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    // Récupérer les données du webhook PayPal
    const body = await req.text()
    const params = new URLSearchParams(body)

    const paymentStatus = params.get('payment_status')
    const invoiceId = params.get('custom')
    const txnId = params.get('txn_id')
    const receiverEmail = params.get('receiver_email')
    const mcGross = params.get('mc_gross')

    console.log('[paypal-webhook] Payment notification received:', {
      paymentStatus,
      invoiceId,
      txnId,
      receiverEmail,
      mcGross,
    })

    // Vérifier que c'est bien un paiement complété
    if (paymentStatus !== 'Completed') {
      console.log('[paypal-webhook] Payment not completed, status:', paymentStatus)
      return NextResponse.json({ message: 'Payment not completed' })
    }

    if (!invoiceId) {
      console.error('[paypal-webhook] No invoice ID in custom field')
      return NextResponse.json({ error: 'No invoice ID' }, { status: 400 })
    }

    // Récupérer la facture
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: {
          select: {
            user: {
              select: {
                paypalEmail: true,
              },
            },
          },
        },
      },
    })

    if (!invoice) {
      console.error('[paypal-webhook] Invoice not found:', invoiceId)
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Vérifier que le paiement a été envoyé au bon compte PayPal
    if (receiverEmail !== invoice.client.user.paypalEmail) {
      console.error('[paypal-webhook] Receiver email mismatch:', {
        received: receiverEmail,
        expected: invoice.client.user.paypalEmail,
      })
      return NextResponse.json({ error: 'Receiver email mismatch' }, { status: 400 })
    }

    // Vérifier que le montant est correct
    const expectedAmount = invoice.total.toFixed(2)
    if (mcGross !== expectedAmount) {
      console.error('[paypal-webhook] Amount mismatch:', {
        received: mcGross,
        expected: expectedAmount,
      })
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // Mettre à jour la facture
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'paid',
        paidAt: new Date(),
        paymentProvider: 'paypal',
        paymentTransactionId: txnId,
      },
    })

    // Marquer les unpaidAmounts comme payés
    await prisma.unpaidAmount.updateMany({
      where: { invoiceId },
      data: { status: 'paid' },
    })

    console.log('[paypal-webhook] Invoice updated successfully:', invoiceId)

    return NextResponse.json({ message: 'Payment processed successfully' })
  } catch (error) {
    console.error('[paypal-webhook] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
