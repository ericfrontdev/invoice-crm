import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  props: { params: Promise<{ fileId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const params = await props.params

  // Vérifier que le fichier appartient à un projet d'un client de l'utilisateur
  const file = await prisma.projectFile.findFirst({
    where: {
      id: params.fileId,
      project: {
        client: { userId: session.user.id },
      },
    },
  })

  if (!file) {
    return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
  }

  // Supprimer l'entrée de la base de données (fichier stocké en base64)
  await prisma.projectFile.delete({
    where: { id: params.fileId },
  })

  return NextResponse.json({ success: true })
}
