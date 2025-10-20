import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Vérifier que le revenu appartient à l'utilisateur
  const revenue = await prisma.revenue.findUnique({
    where: { id },
  })

  if (!revenue || revenue.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Supprimer le revenu
  await prisma.revenue.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
