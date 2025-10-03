import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')

  if (!clientId) {
    return NextResponse.json({ error: 'clientId requis' }, { status: 400 })
  }

  // Vérifier que le client appartient à l'utilisateur
  const client = await prisma.client.findUnique({
    where: { id: clientId, userId: session.user.id },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
  }

  const projects = await prisma.project.findMany({
    where: { clientId },
    include: {
      invoices: {
        select: {
          id: true,
          number: true,
          total: true,
          status: true,
        },
      },
      files: {
        select: {
          id: true,
          filename: true,
          fileSize: true,
          uploadedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await request.json()
  const { clientId, name, description, status, budget, startDate, endDate, invoiceIds } = body

  if (!clientId || !name) {
    return NextResponse.json(
      { error: 'clientId et name requis' },
      { status: 400 }
    )
  }

  // Vérifier que le client appartient à l'utilisateur
  const client = await prisma.client.findUnique({
    where: { id: clientId, userId: session.user.id },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      status: status || 'active',
      budget: budget ? parseFloat(budget) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      clientId,
    },
    include: {
      invoices: true,
      files: true,
    },
  })

  // Lier les factures au projet si spécifiées
  if (invoiceIds && Array.isArray(invoiceIds) && invoiceIds.length > 0) {
    await prisma.invoice.updateMany({
      where: {
        id: { in: invoiceIds },
        clientId, // Sécurité: s'assurer que les factures appartiennent au bon client
      },
      data: {
        projectId: project.id,
      },
    })
  }

  return NextResponse.json(project, { status: 201 })
}
