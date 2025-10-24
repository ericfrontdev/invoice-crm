'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, RefreshCw, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FeedbackDetailsModal } from '@/components/admin/feedback-details-modal'

interface UserFeedbackListProps {
  feedbacks: {
    id: string
    type: string
    severity: string
    title: string
    status: string
    createdAt: Date
    _count: {
      messages: number
    }
  }[]
}

const typeLabels: Record<string, { label: string; emoji: string }> = {
  bug: { label: 'Bug', emoji: '🐛' },
  feature: { label: 'Nouvelle fonctionnalité', emoji: '✨' },
  improvement: { label: 'Amélioration', emoji: '💡' },
  other: { label: 'Autre', emoji: '💬' },
}

const severityLabels: Record<string, { label: string; color: string }> = {
  critical: { label: 'Critique', color: 'bg-red-500' },
  high: { label: 'Élevé', color: 'bg-orange-500' },
  medium: { label: 'Moyen', color: 'bg-yellow-500' },
  low: { label: 'Faible', color: 'bg-green-500' },
}

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: 'Nouveau', color: 'bg-blue-500' },
  in_progress: { label: 'En cours', color: 'bg-purple-500' },
  resolved: { label: 'Résolu', color: 'bg-green-500' },
  closed: { label: 'Fermé', color: 'bg-gray-500' },
}

export function UserFeedbackList({ feedbacks }: UserFeedbackListProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null)

  const router = useRouter()

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesType = typeFilter === 'all' || feedback.type === typeFilter
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter
    const matchesSearch =
      searchQuery === '' ||
      feedback.title.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesType && matchesStatus && matchesSearch
  })

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <>
      <div className="bg-card rounded-lg border">
        {/* Filters */}
        <div className="p-4 border-b space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Type filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="bug">🐛 Bug</SelectItem>
                <SelectItem value="feature">✨ Feature</SelectItem>
                <SelectItem value="improvement">💡 Amélioration</SelectItem>
                <SelectItem value="other">💬 Autre</SelectItem>
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">🆕 Nouveau</SelectItem>
                <SelectItem value="in_progress">⏳ En cours</SelectItem>
                <SelectItem value="resolved">✅ Résolu</SelectItem>
                <SelectItem value="closed">🔒 Fermé</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredFeedbacks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? (
                <>Aucun feedback ne correspond à vos critères de recherche</>
              ) : (
                <>
                  Vous n&apos;avez pas encore envoyé de feedback.
                  <br />
                  Utilisez le bouton sur le côté droit de l&apos;écran pour en envoyer un !
                </>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">Type</th>
                  <th className="text-left p-4 font-medium text-sm">Titre</th>
                  <th className="text-left p-4 font-medium text-sm">Urgence</th>
                  <th className="text-left p-4 font-medium text-sm">Statut</th>
                  <th className="text-left p-4 font-medium text-sm">Date</th>
                  <th className="text-left p-4 font-medium text-sm">Messages</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((feedback) => (
                  <tr
                    key={feedback.id}
                    onClick={() => setSelectedFeedbackId(feedback.id)}
                    className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {typeLabels[feedback.type]?.emoji}
                        </span>
                        <span className="text-sm hidden md:inline">
                          {typeLabels[feedback.type]?.label}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{feedback.title}</div>
                    </td>
                    <td className="p-4">
                      <Badge className={severityLabels[feedback.severity]?.color}>
                        {severityLabels[feedback.severity]?.label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={statusLabels[feedback.status]?.color}>
                        {statusLabels[feedback.status]?.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(feedback.createdAt).toLocaleDateString('fr-CA')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm">
                        <MessageSquare className="h-4 w-4" />
                        <span>{feedback._count.messages}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedFeedbackId && (
        <FeedbackDetailsModal
          feedbackId={selectedFeedbackId}
          isOpen={!!selectedFeedbackId}
          onClose={() => setSelectedFeedbackId(null)}
          isSuperAdmin={false}
        />
      )}
    </>
  )
}
