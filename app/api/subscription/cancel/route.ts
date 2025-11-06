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

    // Mettre à jour dans notre BD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionEndsAt,
      },
    })

    // TODO: Appeler l'API Helcim pour annuler l'abonnement récurrent
    // Pour l'instant, on se contente de marquer comme annulé dans notre BD
    // L'utilisateur gardera l'accès jusqu'à la fin de la période payée

    return NextResponse.json({
      success: true,
      message: 'Abonnement annulé avec succès',
      endsAt: subscriptionEndsAt,
    })
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'abonnement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
