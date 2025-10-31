'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
import { Search, RefreshCw, Bug, Sparkles, Lightbulb, MessageCircle, MessageSquare } from 'lucide-react'

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
    name: string
    email: string
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

const typeLabels: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature',
  improvement: 'Amélioration',
  other: 'Autre',
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
}

const statusLabels: Record<string, string> = {
  new: '🆕 Nouveau',
  reviewing: '👀 En révision',
  in_progress: '⏳ En cours',
  resolved: '✅ Résolu',
  wont_fix: '❌ Won\'t fix',
}

export function FeedbackList({
  feedbacks,
  feedbackSystemEnabled: initialEnabled,
}: {
  feedbacks: Feedback[]
  feedbackSystemEnabled: boolean
}) {
  const router = useRouter()
  const [systemEnabled, setSystemEnabled] = useState(initialEnabled)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)

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
        alert('Erreur lors de la mise à jour')
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour')
    } finally {
      setToggling(false)
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
              <h2 className="text-lg font-semibold">Système de feedback</h2>
              <p className="text-sm text-muted-foreground">
                {systemEnabled
                  ? 'Le widget est visible pour tous les utilisateurs'
                  : 'Le widget est masqué. Aucun nouveau feedback ne peut être envoyé.'}
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
                {systemEnabled ? 'Activé' : 'Désactivé'}
              </Label>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, message, auteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="bug">Bugs</SelectItem>
                <SelectItem value="feature">Features</SelectItem>
                <SelectItem value="improvement">Améliorations</SelectItem>
                <SelectItem value="other">Autres</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouveaux</SelectItem>
                <SelectItem value="reviewing">En révision</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="resolved">Résolus</SelectItem>
                <SelectItem value="wont_fix">Won&apos;t fix</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.refresh()}
              title="Rafraîchir"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table Desktop / Cards Mobile */}
        {filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {feedbacks.length === 0
              ? 'Aucun feedback pour le moment'
              : 'Aucun feedback ne correspond aux filtres'}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium text-sm">Type</th>
                    <th className="text-left p-3 font-medium text-sm">Titre</th>
                    <th className="text-left p-3 font-medium text-sm">Auteur</th>
                    <th className="text-left p-3 font-medium text-sm">Urgence</th>
                    <th className="text-left p-3 font-medium text-sm">Statut</th>
                    <th className="text-left p-3 font-medium text-sm">Date</th>
                    <th className="text-center p-3 font-medium text-sm">Messages</th>
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
                            {typeLabels[feedback.type] || feedback.type}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {!feedback.viewedAt && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full" title="Non lu" />
                          )}
                          <span className="font-medium text-sm">
                            {feedback.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {feedback.isAnonymous ? (
                            <span className="text-muted-foreground italic">Anonyme</span>
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
                          {statusLabels[feedback.status] || feedback.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(feedback.createdAt).toLocaleDateString('fr-FR', {
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
                              <span className="h-2 w-2 bg-blue-500 rounded-full" title="Non lu" />
                            )}
                            <h3 className="font-medium text-sm">{feedback.title}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {typeLabels[feedback.type] || feedback.type}
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
                        <span className="text-muted-foreground">Auteur:</span>
                        {feedback.isAnonymous ? (
                          <span className="italic">Anonyme</span>
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
                        <span>{statusLabels[feedback.status] || feedback.status}</span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {new Date(feedback.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
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
