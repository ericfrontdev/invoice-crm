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

  const notes = await prisma.note.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(notes)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await request.json()
  const { clientId, title, content, tags } = body

  if (!clientId || !title || !content) {
    return NextResponse.json(
      { error: 'clientId, title et content requis' },
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

  const note = await prisma.note.create({
    data: {
      title,
      content,
      tags: tags || [],
      clientId,
    },
  })

  return NextResponse.json(note, { status: 201 })
}
