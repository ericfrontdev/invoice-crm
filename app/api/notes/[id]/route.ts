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
  const { title, content, tags } = body

  // Vérifier que la note appartient à un client de l'utilisateur
  const note = await prisma.note.findFirst({
    where: {
      id: params.id,
      client: { userId: session.user.id },
    },
  })

  if (!note) {
    return NextResponse.json({ error: 'Note non trouvée' }, { status: 404 })
  }

  const updatedNote = await prisma.note.update({
    where: { id: params.id },
    data: {
      ...(title && { title }),
      ...(content && { content }),
      ...(tags !== undefined && { tags }),
    },
  })

  return NextResponse.json(updatedNote)
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

  // Vérifier que la note appartient à un client de l'utilisateur
  const note = await prisma.note.findFirst({
    where: {
      id: params.id,
      client: { userId: session.user.id },
    },
  })

  if (!note) {
    return NextResponse.json({ error: 'Note non trouvée' }, { status: 404 })
  }

  await prisma.note.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
