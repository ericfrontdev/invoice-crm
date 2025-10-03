import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const params = await props.params
  const body = await request.json()
  const { name, description, status, budget, startDate, endDate, invoiceIds } = body

  // Vérifier que le projet appartient à un client de l'utilisateur
  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      client: { userId: session.user.id },
    },
    include: {
      client: true,
    },
  })

  if (!project) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  const updatedProject = await prisma.project.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(budget !== undefined && { budget: budget ? parseFloat(budget) : null }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
    },
    include: {
      invoices: true,
      files: true,
    },
  })

  // Mettre à jour les liens de factures si spécifiés
  if (invoiceIds !== undefined && Array.isArray(invoiceIds)) {
    // D'abord, délier toutes les factures actuelles du projet
    await prisma.invoice.updateMany({
      where: {
        projectId: params.id,
      },
      data: {
        projectId: null,
      },
    })

    // Ensuite, lier les nouvelles factures
    if (invoiceIds.length > 0) {
      await prisma.invoice.updateMany({
        where: {
          id: { in: invoiceIds },
          clientId: project.clientId, // Sécurité: s'assurer que les factures appartiennent au bon client
        },
        data: {
          projectId: params.id,
        },
      })
    }
  }

  return NextResponse.json(updatedProject)
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const params = await props.params

  // Vérifier que le projet appartient à un client de l'utilisateur
  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      client: { userId: session.user.id },
    },
  })

  if (!project) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  await prisma.project.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
