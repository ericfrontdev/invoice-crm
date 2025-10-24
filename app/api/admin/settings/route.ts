import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/settings - Récupérer les settings système
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'user est super admin
    const isSuperAdmin = await prisma.superAdmin.findUnique({
      where: { userId: session.user.id }
    })

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Récupérer ou créer les settings
    let settings = await prisma.systemSettings.findFirst()

    if (!settings) {
      // Créer les settings par défaut si ils n'existent pas
      settings = await prisma.systemSettings.create({
        data: {
          feedbackSystemEnabled: true,
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/settings - Mettre à jour les settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'user est super admin
    const isSuperAdmin = await prisma.superAdmin.findUnique({
      where: { userId: session.user.id }
    })

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await req.json()
    const { feedbackSystemEnabled } = body

    // Récupérer ou créer les settings
    let settings = await prisma.systemSettings.findFirst()

    if (!settings) {
      // Créer si n'existe pas
      settings = await prisma.systemSettings.create({
        data: {
          feedbackSystemEnabled: feedbackSystemEnabled ?? true,
          updatedBy: session.user.id,
        }
      })
    } else {
      // Mettre à jour
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          feedbackSystemEnabled: feedbackSystemEnabled ?? settings.feedbackSystemEnabled,
          updatedBy: session.user.id,
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    )
  }
}
