import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

interface HelcimWebhookData {
  type?: string
  eventType?: string
  id?: string // transactionId pour cardTransaction
  customer?: {
    customerCode?: string
    id?: string
  }
  customerCode?: string
  customerId?: string
}

interface HelcimTransactionResponse {
  cardTransactionId: number
  dateCreated: string
  status: string
  type: string
  amount: number
  currency: string
  customerCode?: string
  customerId?: number
  // ... autres champs
}

export async function POST(request: Request) {
  const signature = request.headers.get('helcim-signature')
  const webhookSecret = process.env.HELCIM_WEBHOOK_SECRET
  let body = ''
  let parsedBody: HelcimWebhookData
  let statusCode = 200
  let errorMessage: string | null = null

  try {
    // Collecter tous les headers
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    // Vérifier la signature Helcim pour la sécurité
    if (webhookSecret && signature) {
      body = await request.text()
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('Signature webhook invalide')
        statusCode = 401
        errorMessage = 'Signature invalide'

        // Logger en BD avant de retourner
        await prisma.webhookLog.create({
          data: {
            endpoint: '/api/webhooks/billing',
            method: 'POST',
            headers: JSON.stringify(headers),
            body,
            signature,
            status: statusCode,
            error: errorMessage,
          },
        })

        return NextResponse.json({ error: errorMessage }, { status: statusCode })
      }

      parsedBody = JSON.parse(body)
      console.log('Webhook Helcim reçu (vérifié):', parsedBody)
    } else {
      // Si pas de secret configuré, traiter quand même (pour dev)
      parsedBody = await request.json()
      body = JSON.stringify(parsedBody)
      console.log('Webhook Helcim reçu (non vérifié):', parsedBody)
    }

    // Logger en BD AVANT le traitement
    await prisma.webhookLog.create({
      data: {
        endpoint: '/api/webhooks/billing',
        method: 'POST',
        headers: JSON.stringify(headers),
        body,
        signature,
        status: statusCode,
        error: null,
      },
    })

    // Traiter le webhook
    return await processWebhook(parsedBody)
  } catch (error) {
    console.error('Erreur webhook Helcim:', error)
    statusCode = 500
    errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Logger l'erreur en BD
    try {
      await prisma.webhookLog.create({
        data: {
          endpoint: '/api/webhooks/billing',
          method: 'POST',
          headers: JSON.stringify({}),
          body: body || '',
          signature,
          status: statusCode,
          error: errorMessage,
        },
      })
    } catch (logError) {
      console.error('Erreur lors du logging:', logError)
    }

    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: statusCode }
    )
  }
}

async function processWebhook(body: HelcimWebhookData) {
  try {
    // Vérifier le type d'événement
    const eventType = body.type || body.eventType

    switch (eventType) {
      case 'cardTransaction':
        // Pour les transactions d'abonnement, on doit récupérer les détails complets
        await handleCardTransaction(body)
        break

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

async function handleCardTransaction(data: HelcimWebhookData) {
  const debugLogs: string[] = []
  debugLogs.push('[1] Webhook cardTransaction reçu')
  debugLogs.push(`[2] Payload: ${JSON.stringify(data)}`)

  const transactionId = data.id

  if (!transactionId) {
    debugLogs.push('[3] ERREUR: Pas de transactionId dans le webhook')
    await logDebugInfo(transactionId || 'unknown', debugLogs.join('\n'))
    return
  }

  debugLogs.push(`[3] TransactionId trouvé: ${transactionId}`)

  // Appeler l'API Helcim pour obtenir les détails complets
  try {
    const helcimApiToken = process.env.HELCIM_API_TOKEN

    if (!helcimApiToken) {
      debugLogs.push('[4] ERREUR: HELCIM_API_TOKEN non configuré dans les variables d\'environnement')
      await logDebugInfo(transactionId, debugLogs.join('\n'))
      return
    }

    debugLogs.push('[4] HELCIM_API_TOKEN trouvé')
    debugLogs.push(`[5] Appel API: GET https://api.helcim.com/v2/card-transactions/${transactionId}`)

    const response = await fetch(
      `https://api.helcim.com/v2/card-transactions/${transactionId}`,
      {
        method: 'GET',
        headers: {
          'api-token': helcimApiToken,
          'Content-Type': 'application/json',
        },
      }
    )

    debugLogs.push(`[6] Réponse API: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      debugLogs.push(`[7] ERREUR API: ${errorText}`)
      await logDebugInfo(transactionId, debugLogs.join('\n'))
      return
    }

    const transaction: HelcimTransactionResponse = await response.json()
    debugLogs.push(`[7] Transaction récupérée: ${JSON.stringify(transaction)}`)

    const customerCode = transaction.customerCode

    if (!customerCode) {
      debugLogs.push('[8] ERREUR: Pas de customerCode dans la transaction')
      await logDebugInfo(transactionId, debugLogs.join('\n'))
      return
    }

    debugLogs.push(`[8] CustomerCode trouvé: ${customerCode}`)

    // Mettre à jour l'utilisateur
    debugLogs.push('[9] Mise à jour de l\'utilisateur en base de données...')

    await prisma.user.update({
      where: { id: customerCode },
      data: {
        plan: 'pro',
        subscriptionStatus: 'active',
        helcimCustomerId: transaction.customerId?.toString(),
        subscriptionEndsAt: null,
      },
    })

    debugLogs.push(`[10] ✅ Succès! Utilisateur ${customerCode} mis à jour en plan Pro`)
    await logDebugInfo(transactionId, debugLogs.join('\n'))
  } catch (error) {
    debugLogs.push(`[ERROR] Exception: ${error instanceof Error ? error.message : String(error)}`)
    if (error instanceof Error && error.stack) {
      debugLogs.push(`Stack: ${error.stack}`)
    }
    await logDebugInfo(transactionId || 'unknown', debugLogs.join('\n'))
    throw error
  }
}

async function logDebugInfo(transactionId: string, debugInfo: string) {
  try {
    // Trouver le dernier webhook log pour cette transaction
    const lastLog = await prisma.webhookLog.findFirst({
      where: {
        body: {
          contains: transactionId,
        },
      },
      orderBy: {
        processedAt: 'desc',
      },
    })

    if (lastLog) {
      await prisma.webhookLog.update({
        where: { id: lastLog.id },
        data: { debugInfo },
      })
    }
  } catch (error) {
    console.error('[logDebugInfo] Erreur:', error)
  }
}

async function handlePaymentSuccess(data: HelcimWebhookData) {
  console.log('[handlePaymentSuccess] Full payload:', JSON.stringify(data, null, 2))

  const customerCode = data.customer?.customerCode || data.customerCode

  if (!customerCode) {
    console.error('[handlePaymentSuccess] ERREUR: Pas de customerCode dans le webhook')
    console.error('[handlePaymentSuccess] data.customer:', data.customer)
    console.error('[handlePaymentSuccess] data.customerCode:', data.customerCode)
    console.error('[handlePaymentSuccess] Full data keys:', Object.keys(data))
    return
  }

  console.log(`[handlePaymentSuccess] customerCode trouvé: ${customerCode}`)

  // Mettre à jour l'utilisateur
  try {
    await prisma.user.update({
      where: { id: customerCode },
      data: {
        plan: 'pro',
        subscriptionStatus: 'active',
        helcimCustomerId: data.customer?.id || data.customerId,
        subscriptionEndsAt: null, // L'abonnement est actif
      },
    })

    console.log(`[handlePaymentSuccess] ✅ Abonnement activé pour l'utilisateur ${customerCode}`)
  } catch (error) {
    console.error(`[handlePaymentSuccess] ❌ Erreur lors de la mise à jour de l'utilisateur:`, error)
    throw error
  }
}

async function handlePaymentFailed(data: HelcimWebhookData) {
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

async function handleSubscriptionCancelled(data: HelcimWebhookData) {
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
