import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    // Vérifier la signature Helcim pour la sécurité
    const signature = request.headers.get('helcim-signature')
    const webhookSecret = process.env.HELCIM_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      const body = await request.text()
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('Signature webhook invalide')
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
      }

      const parsedBody = JSON.parse(body)
      console.log('Webhook Helcim reçu (vérifié):', parsedBody)
      return await processWebhook(parsedBody)
    }

    // Si pas de secret configuré, traiter quand même (pour dev)
    const body = await request.json()
    console.log('Webhook Helcim reçu (non vérifié):', body)
    return await processWebhook(body)
  } catch (error) {
    console.error('Erreur webhook Helcim:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    )
  }
}

async function processWebhook(body: any) {
  try {

    // Vérifier le type d'événement
    const eventType = body.type || body.eventType

    switch (eventType) {
      case 'payment.success':
      case 'recurring.success':
        await handlePaymentSuccess(body)
        break

      case 'payment.failed':
      case 'recurring.failed':
        await handlePaymentFailed(body)
        break

      case 'subscription.cancelled':
      case 'recurring.cancelled':
        await handleSubscriptionCancelled(body)
        break

      default:
        console.log('Type d\'événement non géré:', eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erreur processWebhook:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(data: any) {
  const customerCode = data.customer?.customerCode || data.customerCode

  if (!customerCode) {
    console.error('Pas de customerCode dans le webhook')
    return
  }

  // Mettre à jour l'utilisateur
  await prisma.user.update({
    where: { id: customerCode },
    data: {
      plan: 'pro',
      subscriptionStatus: 'active',
      helcimCustomerId: data.customer?.id || data.customerId,
      subscriptionEndsAt: null, // L'abonnement est actif
    },
  })

  console.log(`Abonnement activé pour l'utilisateur ${customerCode}`)
}

async function handlePaymentFailed(data: any) {
  const customerCode = data.customer?.customerCode || data.customerCode

  if (!customerCode) {
    console.error('Pas de customerCode dans le webhook')
    return
  }

  // Mettre à jour le statut à "past_due"
  await prisma.user.update({
    where: { id: customerCode },
    data: {
      subscriptionStatus: 'past_due',
    },
  })

  console.log(`Paiement échoué pour l'utilisateur ${customerCode}`)

  // TODO: Envoyer un email à l'utilisateur pour l'informer
}

async function handleSubscriptionCancelled(data: any) {
  const customerCode = data.customer?.customerCode || data.customerCode

  if (!customerCode) {
    console.error('Pas de customerCode dans le webhook')
    return
  }

  // Calculer la date de fin de l'abonnement (30 jours à partir d'aujourd'hui)
  const subscriptionEndsAt = new Date()
  subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30)

  // Mettre à jour l'utilisateur
  await prisma.user.update({
    where: { id: customerCode },
    data: {
      subscriptionStatus: 'canceled',
      subscriptionEndsAt,
    },
  })

  console.log(`Abonnement annulé pour l'utilisateur ${customerCode}`)

  // TODO: Envoyer un email de confirmation d'annulation
}
