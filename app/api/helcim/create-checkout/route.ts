import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les informations de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        betaTester: true,
        lifetimeDiscount: true,
        plan: true,
        subscriptionStatus: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier si déjà abonné
    if (user.plan === 'pro' && user.subscriptionStatus === 'active') {
      return NextResponse.json(
        { error: 'Vous êtes déjà abonné' },
        { status: 400 }
      )
    }

    // Déterminer le plan selon le statut beta tester
    const isBetaTester = user.betaTester && user.lifetimeDiscount > 0
    const planId = isBetaTester
      ? process.env.HELCIM_PLAN_ID_BETA
      : process.env.HELCIM_PLAN_ID_PRO

    if (!planId) {
      console.error('ID de plan Helcim manquant')
      return NextResponse.json(
        { error: 'Configuration de paiement manquante' },
        { status: 500 }
      )
    }

    // Construire l'URL d'abonnement Helcim avec les paramètres du client
    const subscriptionUrl = new URL(`https://subscriptions.helcim.com/subscribe/${planId}`)

    // Ajouter les informations du client en query params (si supporté par Helcim)
    subscriptionUrl.searchParams.set('customerCode', user.id)
    subscriptionUrl.searchParams.set('email', user.email)
    if (user.name) {
      subscriptionUrl.searchParams.set('name', user.name)
    }

    return NextResponse.json({
      url: subscriptionUrl.toString(),
      planId,
    })
  } catch (error) {
    console.error('Erreur lors de la création de la session Helcim:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
