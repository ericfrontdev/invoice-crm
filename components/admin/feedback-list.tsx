'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { FeedbackDetailsModal } from '@/components/admin/feedback-details-modal'
import { Search, RefreshCw, Bug, Sparkles, Lightbulb, MessageCircle, MessageSquare, MoreVertical, Check, X, RotateCcw } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

const typeIcons: Record<string, typeof Bug> = {
  bug: Bug,
  feature: Sparkles,
  improvement: Lightbulb,
  other: MessageCircle,
}


const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
}


export function FeedbackList({
  feedbacks,
  feedbackSystemEnabled: initialEnabled,
}: {
  feedbacks: Feedback[]
  feedbackSystemEnabled: boolean
}) {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const [systemEnabled, setSystemEnabled] = useState(initialEnabled)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bug': return t('feedback.bug')
      case 'feature': return t('feedback.feature')
      case 'improvement': return t('feedback.improvement')
      case 'other': return t('feedback.other')
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return `🆕 ${t('feedback.new')}`
      case 'reviewing': return `👀 ${t('feedback.reviewing')}`
      case 'in_progress': return `⏳ ${t('feedback.inProgress')}`
      case 'resolved': return `✅ ${t('admin.resolvedPlural')}`
      case 'wont_fix': return `❌ ${t('feedback.wontFix')}`
      default: return status
    }
  }

  const handleToggleSystem = async (enabled: boolean) => {
    setToggling(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackSystemEnabled: enabled }),
      })

      if (res.ok) {
        setSystemEnabled(enabled)
        router.refresh()
      } else {
        alert(t('feedback.updateError'))
      }
    } catch {
      alert(t('feedback.updateError'))
    } finally {
      setToggling(false)
    }
  }

  const handleStatusChange = async (feedbackId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation() // Empêcher l'ouverture de la modal pendant le clic sur le menu
    setResolvingId(feedbackId)

    try {
      const res = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert(t('feedback.updateError'))
      }
    } catch {
      alert(t('feedback.updateError'))
    } finally {
      setResolvingId(null)
    }
  }

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter((f) => {
    if (typeFilter !== 'all' && f.type !== typeFilter) return false
    if (statusFilter !== 'all' && f.status !== statusFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        f.title.toLowerCase().includes(query) ||
        f.message.toLowerCase().includes(query) ||
        f.user?.name?.toLowerCase().includes(query) ||
        f.user?.email?.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <>
      <div className="bg-card rounded-lg border">
        {/* Header with toggle */}
        <div className="p-6 border-b space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t('feedback.feedbackSystem')}</h2>
              <p className="text-sm text-muted-foreground">
                {systemEnabled
                  ? t('feedback.widgetVisible')
                  : t('feedback.widgetHidden')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="feedback-system"
                checked={systemEnabled}
                onCheckedChange={handleToggleSystem}
                disabled={toggling}
              />
              <Label htmlFor="feedback-system" className="cursor-pointer">
                {systemEnabled ? t('feedback.enabled') : t('feedback.disabled')}
              </Label>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('feedback.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('feedback.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('feedback.allTypes')}</SelectItem>
                <SelectItem value="bug">{t('feedback.bugs')}</SelectItem>
                <SelectItem value="feature">{t('feedback.features')}</SelectItem>
                <SelectItem value="improvement">{t('admin.improvements')}</SelectItem>
                <SelectItem value="other">{t('feedback.others')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('feedback.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('feedback.allStatuses')}</SelectItem>
                <SelectItem value="new">{t('admin.newPlural')}</SelectItem>
                <SelectItem value="reviewing">{t('feedback.reviewing')}</SelectItem>
                <SelectItem value="in_progress">{t('feedback.inProgress')}</SelectItem>
                <SelectItem value="resolved">{t('admin.resolvedPlural')}</SelectItem>
                <SelectItem value="wont_fix">{t('feedback.wontFix')}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.refresh()}
              title={t('feedback.refresh')}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table Desktop / Cards Mobile */}
        {filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {feedbacks.length === 0
              ? t('feedback.noFeedback')
              : t('feedback.noFeedbackFiltered')}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium text-sm">{t('feedback.type')}</th>
                    <th className="text-left p-3 font-medium text-sm">{t('feedback.title')}</th>
                    <th className="text-left p-3 font-medium text-sm">{t('feedback.author')}</th>
                    <th className="text-left p-3 font-medium text-sm">{t('feedback.urgency')}</th>
                    <th className="text-left p-3 font-medium text-sm">{t('feedback.status')}</th>
                    <th className="text-left p-3 font-medium text-sm">{t('feedback.date')}</th>
                    <th className="text-center p-3 font-medium text-sm">{t('feedback.messages')}</th>
                    <th className="text-center p-3 font-medium text-sm">{t('feedback.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.map((feedback) => (
                    <tr
                      key={feedback.id}
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedFeedback(feedback.id)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = typeIcons[feedback.type] || MessageCircle
                            return <Icon className="h-5 w-5 text-muted-foreground" />
                          })()}
                          <span className="text-sm">
                            {getTypeLabel(feedback.type)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {!feedback.viewedAt && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full" title={t('feedback.unread')} />
                          )}
                          <span className="font-medium text-sm">
                            {feedback.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {feedback.isAnonymous ? (
                            <span className="text-muted-foreground italic">{t('feedback.anonymous')}</span>
                          ) : (
                            <div>
                              <div className="font-medium">{feedback.user?.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {feedback.user?.email}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="secondary"
                          className={severityColors[feedback.severity] || ''}
                        >
                          {feedback.severity}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">
                          {getStatusLabel(feedback.status)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(feedback.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {feedback._count.messages > 0 && (
                          <Badge
                            variant="outline"
                            className={
                              feedback.hasUnreadMessages
                                ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-400/10 dark:text-red-300 dark:border-red-400/30 font-semibold'
                                : ''
                            }
                          >
                            {feedback._count.messages}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={resolvingId === feedback.id}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(feedback.status === 'new' || feedback.status === 'in_progress') && (
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => handleStatusChange(feedback.id, 'resolved', e)}
                                  disabled={resolvingId === feedback.id}
                                >
                                  <Check className="h-4 w-4 mr-2 text-green-600" />
                                  {t('feedback.markAsResolved')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => handleStatusChange(feedback.id, 'closed', e)}
                                  disabled={resolvingId === feedback.id}
                                >
                                  <X className="h-4 w-4 mr-2 text-gray-600" />
                                  {t('feedback.close')}
                                </DropdownMenuItem>
                              </>
                            )}
                            {feedback.status === 'resolved' && (
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => handleStatusChange(feedback.id, 'in_progress', e)}
                                  disabled={resolvingId === feedback.id}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2 text-blue-600" />
                                  {t('feedback.reopen')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => handleStatusChange(feedback.id, 'closed', e)}
                                  disabled={resolvingId === feedback.id}
                                >
                                  <X className="h-4 w-4 mr-2 text-gray-600" />
                                  {t('feedback.close')}
                                </DropdownMenuItem>
                              </>
                            )}
                            {feedback.status === 'closed' && (
                              <DropdownMenuItem
                                onClick={(e) => handleStatusChange(feedback.id, 'in_progress', e)}
                                disabled={resolvingId === feedback.id}
                              >
                                <RotateCcw className="h-4 w-4 mr-2 text-blue-600" />
                                {t('feedback.reopen')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredFeedbacks.map((feedback) => {
                const Icon = typeIcons[feedback.type] || MessageCircle
                return (
                  <div
                    key={feedback.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedFeedback(feedback.id)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {!feedback.viewedAt && (
                              <span className="h-2 w-2 bg-blue-500 rounded-full" title={t('feedback.unread')} />
                            )}
                            <h3 className="font-medium text-sm">{feedback.title}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getTypeLabel(feedback.type)}
                          </p>
                        </div>
                      </div>
                      {feedback._count.messages > 0 && (
                        <Badge
                          variant="outline"
                          className={`flex-shrink-0 ${
                            feedback.hasUnreadMessages
                              ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-400/10 dark:text-red-300 dark:border-red-400/30 font-semibold'
                              : ''
                          }`}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {feedback._count.messages}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t('feedback.author')}:</span>
                        {feedback.isAnonymous ? (
                          <span className="italic">{t('feedback.anonymous')}</span>
                        ) : (
                          <span className="font-medium">{feedback.user?.name}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={severityColors[feedback.severity] || ''}
                        >
                          {feedback.severity}
                        </Badge>
                        <span className="text-muted-foreground">•</span>
                        <span>{getStatusLabel(feedback.status)}</span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {new Date(feedback.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={resolvingId === feedback.id}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4 mr-2" />
                            {t('feedback.actions')}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48">
                          {(feedback.status === 'new' || feedback.status === 'in_progress') && (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => handleStatusChange(feedback.id, 'resolved', e)}
                                disabled={resolvingId === feedback.id}
                              >
                                <Check className="h-4 w-4 mr-2 text-green-600" />
                                {t('feedback.markAsResolved')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleStatusChange(feedback.id, 'closed', e)}
                                disabled={resolvingId === feedback.id}
                              >
                                <X className="h-4 w-4 mr-2 text-gray-600" />
                                {t('feedback.close')}
                              </DropdownMenuItem>
                            </>
                          )}
                          {feedback.status === 'resolved' && (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => handleStatusChange(feedback.id, 'in_progress', e)}
                                disabled={resolvingId === feedback.id}
                              >
                                <RotateCcw className="h-4 w-4 mr-2 text-blue-600" />
                                {t('feedback.reopen')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleStatusChange(feedback.id, 'closed', e)}
                                disabled={resolvingId === feedback.id}
                              >
                                <X className="h-4 w-4 mr-2 text-gray-600" />
                                {t('feedback.close')}
                              </DropdownMenuItem>
                            </>
                          )}
                          {feedback.status === 'closed' && (
                            <DropdownMenuItem
                              onClick={(e) => handleStatusChange(feedback.id, 'in_progress', e)}
                              disabled={resolvingId === feedback.id}
                            >
                              <RotateCcw className="h-4 w-4 mr-2 text-blue-600" />
                              {t('feedback.reopen')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal détails */}
      {selectedFeedback && (
        <FeedbackDetailsModal
          feedbackId={selectedFeedback}
          isOpen={!!selectedFeedback}
          onClose={() => {
            setSelectedFeedback(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
