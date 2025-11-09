import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminFeedbackPageClient } from '@/components/pages/admin-feedback-page-client'

export const revalidate = 0

async function getFeedbackStats(userId: string) {
  // Vérifier que c'est un super admin
  const isSuperAdmin = await prisma.superAdmin.findUnique({
    where: { userId }
  })

  if (!isSuperAdmin) {
    return null
  }

  const [
    total,
    newCount,
    inProgressCount,
    resolvedCount,
    bugCount,
    featureCount,
    improvementCount,
    criticalCount,
    feedbacks,
    settings
  ] = await Promise.all([
    prisma.feedback.count(),
    prisma.feedback.count({ where: { viewedAt: null } }), // Count unviewed feedbacks instead of status='new'
    prisma.feedback.count({ where: { status: 'in_progress' } }),
    prisma.feedback.count({ where: { status: 'resolved' } }),
    prisma.feedback.count({ where: { type: 'bug' } }),
    prisma.feedback.count({ where: { type: 'feature' } }),
    prisma.feedback.count({ where: { type: 'improvement' } }),
    prisma.feedback.count({ where: { severity: 'critical' } }),
    prisma.feedback.findMany({
      select: {
        id: true,
        type: true,
        severity: true,
        title: true,
        message: true,
        status: true,
        priority: true,
        createdAt: true,
        viewedAt: true,
        isAnonymous: true,
        lastAdminReadAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            messages: true
          }
        },
        messages: {
          where: {
            authorType: 'user',
          },
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.systemSettings.findFirst()
  ])

  // Calculer s'il y a des messages non lus par l'admin
  const feedbacksWithUnread = feedbacks.map(feedback => {
    const hasUnreadMessages =
      feedback.messages.length > 0 &&
      (!feedback.lastAdminReadAt ||
       new Date(feedback.messages[0].createdAt) > new Date(feedback.lastAdminReadAt))

    return {
      ...feedback,
      hasUnreadMessages,
    }
  })

  return {
    total,
    newCount,
    inProgressCount,
    resolvedCount,
    bugCount,
    featureCount,
    improvementCount,
    criticalCount,
    feedbacks: feedbacksWithUnread,
    feedbackSystemEnabled: settings?.feedbackSystemEnabled ?? true
  }
}

export default async function AdminFeedbackPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const data = await getFeedbackStats(session.user.id)

  if (!data) {
    redirect('/')
  }

  const stats = {
    total: data.total,
    newCount: data.newCount,
    inProgressCount: data.inProgressCount,
    resolvedCount: data.resolvedCount,
    bugCount: data.bugCount,
    featureCount: data.featureCount,
    improvementCount: data.improvementCount,
    criticalCount: data.criticalCount,
  }

  return (
    <AdminFeedbackPageClient
      stats={stats}
      feedbacks={data.feedbacks}
      feedbackSystemEnabled={data.feedbackSystemEnabled}
    />
  )
}
