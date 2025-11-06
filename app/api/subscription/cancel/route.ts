import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        plan: true,
        subscriptionStatus: true,
        helcimCustomerId: true,
        helcimCustomerCode: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier qu'il y a un abonnement actif
    if (user.plan !== 'pro' || user.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Aucun abonnement actif à annuler' },
        { status: 400 }
      )
    }

    // Calculer la date de fin (30 jours à partir d'aujourd'hui)
    const subscriptionEndsAt = new Date()
    subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30)

    // Annuler l'abonnement chez Helcim
    const helcimApiToken = process.env.HELCIM_API_TOKEN
    let helcimCanceled = false

    if (helcimApiToken && user.helcimCustomerCode) {
      try {
        // 1. Récupérer les subscriptions du customer
        const subscriptionsRes = await fetch(
          `https://api.helcim.com/v2/subscriptions?customerCode=${user.helcimCustomerCode}`,
          {
            method: 'GET',
            headers: {
              'api-token': helcimApiToken,
              'Content-Type': 'application/json',
            },
          }
        )

        if (subscriptionsRes.ok) {
          const subscriptions = await subscriptionsRes.json()

          // 2. Trouver la première subscription active
          const activeSubscription = Array.isArray(subscriptions)
            ? subscriptions.find((sub: { status: string }) => sub.status === 'active')
            : null

          if (activeSubscription?.id) {
            // 3. Annuler la subscription chez Helcim
            const cancelRes = await fetch(
              `https://api.helcim.com/v2/subscriptions/${activeSubscription.id}`,
              {
                method: 'DELETE',
                headers: {
                  'api-token': helcimApiToken,
                  'Content-Type': 'application/json',
                },
              }
            )

            if (cancelRes.ok) {
              helcimCanceled = true
              console.log(`[cancel-subscription] Subscription ${activeSubscription.id} annulée chez Helcim`)
            } else {
              console.error('[cancel-subscription] Erreur annulation Helcim:', await cancelRes.text())
            }
          } else {
            console.warn('[cancel-subscription] Aucune subscription active trouvée chez Helcim')
          }
        } else {
          console.error('[cancel-subscription] Erreur récupération subscriptions:', await subscriptionsRes.text())
        }
      } catch (error) {
        console.error('[cancel-subscription] Erreur appel API Helcim:', error)
        // On continue quand même pour annuler dans notre BD
      }
    }

    // Mettre à jour dans notre BD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionEndsAt,
        // Effacer le subscriptionId si annulé avec succès chez Helcim
        ...(helcimCanceled && { helcimSubscriptionId: null }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Abonnement annulé avec succès',
      endsAt: subscriptionEndsAt,
      helcimCanceled,
    })
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'abonnement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
