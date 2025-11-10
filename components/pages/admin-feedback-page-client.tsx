'use client'

import { Bug, Sparkles, Lightbulb, AlertCircle, Clock, CheckCircle, MessageSquare, ArrowLeft } from 'lucide-react'
import { FeedbackList } from '@/components/admin/feedback-list'
import { useTranslation } from '@/lib/i18n-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type FeedbackStats = {
  total: number
  newCount: number
  inProgressCount: number
  resolvedCount: number
  bugCount: number
  featureCount: number
  improvementCount: number
  criticalCount: number
}

type Feedback = {
  id: string
  type: string
  severity: string
  title: string
  message: string
  status: string
  priority: string
  createdAt: Date
  viewedAt: Date | null
  isAnonymous: boolean
  lastAdminReadAt: Date | null
  hasUnreadMessages: boolean
  user: {
    id: string
    name: string | null
    email: string | null
  } | null
  _count: {
    messages: number
  }
}

export function AdminFeedbackPageClient({
  stats,
  feedbacks,
  feedbackSystemEnabled,
}: {
  stats: FeedbackStats
  feedbacks: Feedback[]
  feedbackSystemEnabled: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('admin.backToDashboard')}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">{t('admin.userFeedback')}</h1>
        <p className="text-muted-foreground">
          {t('admin.manageBetaFeedback')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">{t('feedback.total')}</div>
            </div>
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.newCount}</div>
              <div className="text-sm text-muted-foreground">{t('admin.newPlural')}</div>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.inProgressCount}</div>
              <div className="text-sm text-muted-foreground">{t('feedback.inProgress')}</div>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedCount}</div>
              <div className="text-sm text-muted-foreground">{t('admin.resolvedPlural')}</div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">{stats.bugCount}</div>
              <div className="text-xs text-muted-foreground">{t('feedback.bugs')}</div>
            </div>
            <Bug className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">{stats.featureCount}</div>
              <div className="text-xs text-muted-foreground">{t('feedback.features')}</div>
            </div>
            <Sparkles className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">{stats.improvementCount}</div>
              <div className="text-xs text-muted-foreground">{t('admin.improvements')}</div>
            </div>
            <Lightbulb className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-red-600">{stats.criticalCount}</div>
              <div className="text-xs text-muted-foreground">{t('admin.criticalPlural')}</div>
            </div>
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Feedback list with filters and toggle */}
      <FeedbackList
        feedbacks={feedbacks}
        feedbackSystemEnabled={feedbackSystemEnabled}
      />
    </div>
  )
}
