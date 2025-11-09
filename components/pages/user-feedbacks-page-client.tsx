'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserFeedbackList } from '@/components/user/user-feedback-list'
import { useTranslation } from '@/lib/i18n-context'

type FeedbackStats = {
  total: number
  new: number
  in_progress: number
  resolved: number
  bugs: number
  features: number
}

type Feedback = {
  id: string
  type: string
  severity: string
  title: string
  status: string
  createdAt: Date
  lastUserReadAt: Date | null
  hasUnreadMessages: boolean
  _count: {
    messages: number
  }
}

export function UserFeedbacksPageClient({
  feedbacks,
  stats,
}: {
  feedbacks: Feedback[]
  stats: FeedbackStats
}) {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/profil">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('feedback.backToProfile')}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{t('feedback.myFeedbacks')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('feedback.viewHistory')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">{t('feedback.total')}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <div className="text-sm text-muted-foreground">{t('feedback.new')}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-purple-600">
            {stats.in_progress}
          </div>
          <div className="text-sm text-muted-foreground">{t('feedback.inProgress')}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.resolved}
          </div>
          <div className="text-sm text-muted-foreground">{t('feedback.resolved')}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">{stats.bugs}</div>
          <div className="text-sm text-muted-foreground">{t('feedback.bugs')}</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.features}
          </div>
          <div className="text-sm text-muted-foreground">{t('feedback.features')}</div>
        </div>
      </div>

      {/* List */}
      <UserFeedbackList feedbacks={feedbacks} />
    </div>
  )
}
