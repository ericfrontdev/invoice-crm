import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { UserFeedbackList } from '@/components/user/user-feedback-list'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

async function getUserFeedbacks(userId: string) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        type: true,
        severity: true,
        title: true,
        status: true,
        createdAt: true,
        lastUserReadAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
        messages: {
          where: {
            authorType: 'admin',
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
        createdAt: 'desc',
      },
    })

    // Calculer s'il y a des messages non lus
    const feedbacksWithUnread = feedbacks.map(feedback => {
      const hasUnreadMessages =
        feedback.messages.length > 0 &&
        (!feedback.lastUserReadAt ||
         new Date(feedback.messages[0].createdAt) > new Date(feedback.lastUserReadAt))

      return {
        ...feedback,
        hasUnreadMessages,
      }
    })

    const stats = {
      total: feedbacksWithUnread.length,
      new: feedbacksWithUnread.filter((f) => f.status === 'new').length,
      in_progress: feedbacksWithUnread.filter((f) => f.status === 'in_progress').length,
      resolved: feedbacksWithUnread.filter((f) => f.status === 'resolved').length,
      bugs: feedbacksWithUnread.filter((f) => f.type === 'bug').length,
      features: feedbacksWithUnread.filter((f) => f.type === 'feature').length,
    }

    return { feedbacks: feedbacksWithUnread, stats }
  } catch (error) {
    console.error('Error fetching user feedbacks:', error)
    return null
  }
}

export default async function UserFeedbackPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const data = await getUserFeedbacks(session.user.id)

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-destructive">Erreur lors du chargement des feedbacks</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/profil">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour au profil
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Mes Feedbacks</h1>
        <p className="text-muted-foreground mt-2">
          Consultez l&apos;historique de vos commentaires et suggestions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{data.stats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">{data.stats.new}</div>
          <div className="text-sm text-muted-foreground">Nouveau</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-purple-600">
            {data.stats.in_progress}
          </div>
          <div className="text-sm text-muted-foreground">En cours</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {data.stats.resolved}
          </div>
          <div className="text-sm text-muted-foreground">Résolu</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">{data.stats.bugs}</div>
          <div className="text-sm text-muted-foreground">Bugs</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {data.stats.features}
          </div>
          <div className="text-sm text-muted-foreground">Features</div>
        </div>
      </div>

      {/* List */}
      <UserFeedbackList feedbacks={data.feedbacks} />
    </div>
  )
}
