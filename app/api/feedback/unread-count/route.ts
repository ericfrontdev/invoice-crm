import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/feedback/unread-count - Get count of unread/new feedbacks (admin only)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check if user is super admin
    const isSuperAdmin = await prisma.superAdmin.findUnique({
      where: { userId: session.user.id }
    })

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Count feedbacks with status 'new' (not yet viewed)
    const count = await prisma.feedback.count({
      where: {
        status: 'new',
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du nombre de feedbacks non lus' },
      { status: 500 }
    )
  }
}
