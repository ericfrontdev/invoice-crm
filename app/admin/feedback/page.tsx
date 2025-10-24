import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { FeedbackList } from '@/components/admin/feedback-list'

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
    prisma.feedback.count({ where: { status: 'new' } }),
    prisma.feedback.count({ where: { status: 'in_progress' } }),
    prisma.feedback.count({ where: { status: 'resolved' } }),
    prisma.feedback.count({ where: { type: 'bug' } }),
    prisma.feedback.count({ where: { type: 'feature' } }),
    prisma.feedback.count({ where: { type: 'improvement' } }),
    prisma.feedback.count({ where: { severity: 'critical' } }),
    prisma.feedback.findMany({
      include: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.systemSettings.findFirst()
  ])

  return {
    total,
    newCount,
    inProgressCount,
    resolvedCount,
    bugCount,
    featureCount,
    improvementCount,
    criticalCount,
    feedbacks,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Feedback des utilisateurs</h1>
        <p className="text-muted-foreground">
          Gérez les retours et suggestions de vos bêta testeurs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{data.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">{data.newCount}</div>
          <div className="text-sm text-muted-foreground">🆕 Nouveaux</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-orange-600">{data.inProgressCount}</div>
          <div className="text-sm text-muted-foreground">⏳ En cours</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">{data.resolvedCount}</div>
          <div className="text-sm text-muted-foreground">✅ Résolus</div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-3">
          <div className="text-lg font-semibold">{data.bugCount}</div>
          <div className="text-xs text-muted-foreground">🐛 Bugs</div>
        </div>
        <div className="bg-card rounded-lg border p-3">
          <div className="text-lg font-semibold">{data.featureCount}</div>
          <div className="text-xs text-muted-foreground">✨ Features</div>
        </div>
        <div className="bg-card rounded-lg border p-3">
          <div className="text-lg font-semibold">{data.improvementCount}</div>
          <div className="text-xs text-muted-foreground">💡 Améliorations</div>
        </div>
        <div className="bg-card rounded-lg border p-3">
          <div className="text-lg font-semibold text-red-600">{data.criticalCount}</div>
          <div className="text-xs text-muted-foreground">🔴 Critiques</div>
        </div>
      </div>

      {/* Feedback list with filters and toggle */}
      <FeedbackList
        feedbacks={data.feedbacks}
        feedbackSystemEnabled={data.feedbackSystemEnabled}
      />
    </div>
  )
}
