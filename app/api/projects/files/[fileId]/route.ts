import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'

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

  // Supprimer le fichier physique
  try {
    const filepath = join(process.cwd(), 'public', file.fileUrl)
    await unlink(filepath)
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error)
  }

  // Supprimer l'entrée de la base de données
  await prisma.projectFile.delete({
    where: { id: params.fileId },
  })

  return NextResponse.json({ success: true })
}
