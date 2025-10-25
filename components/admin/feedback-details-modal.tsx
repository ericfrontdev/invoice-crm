'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Loader2, Send, Bug, Sparkles, Lightbulb, MessageCircle, Shield } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'

interface FeedbackDetailsModalProps {
  feedbackId: string
  isOpen: boolean
  onClose: () => void
  isSuperAdmin?: boolean
}

interface FeedbackUser {
  id: string
  name: string | null
  email: string | null
}

interface FeedbackMessage {
  id: string
  feedbackId: string
  authorId: string
  authorType: string
  message: string
  createdAt: string
  author: FeedbackUser
}

interface Feedback {
  id: string
  type: string
  severity: string
  title: string
  message: string
  screenshot: string | null
  pageUrl: string
  pageTitle: string | null
  userAgent: string | null
  screenSize: string | null
  deviceType: string | null
  userId: string | null
  isAnonymous: boolean
  status: string
  priority: string
  adminNote: string | null
  linkedIssue: string | null
  createdAt: string
  viewedAt: string | null
  resolvedAt: string | null
  user: FeedbackUser | null
  messages: FeedbackMessage[]
}

const typeIcons: Record<string, typeof Bug> = {
  bug: Bug,
  feature: Sparkles,
  improvement: Lightbulb,
  other: MessageCircle,
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

const priorityLevels = [
  { value: 'critical', label: 'Critique' },
  { value: 'high', label: 'Élevée' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Faible' },
]

const statusOptions = [
  { value: 'new', label: 'Nouveau' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'resolved', label: 'Résolu' },
  { value: 'closed', label: 'Fermé' },
]

export function FeedbackDetailsModal({
  feedbackId,
  isOpen,
  onClose,
  isSuperAdmin = false,
}: FeedbackDetailsModalProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [linkedIssue, setLinkedIssue] = useState('')

  const router = useRouter()

  const loadFeedback = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/feedback/${feedbackId}`)
      if (res.ok) {
        const data = await res.json()
        setFeedback(data)
        setStatus(data.status)
        setPriority(data.priority)
        setAdminNote(data.adminNote || '')
        setLinkedIssue(data.linkedIssue || '')
      }
    } catch (error) {
      console.error('Error loading feedback:', error)
    } finally {
      setLoading(false)
    }
  }, [feedbackId])

  useEffect(() => {
    if (isOpen && feedbackId) {
      loadFeedback()
    }
  }, [isOpen, feedbackId, loadFeedback])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const res = await fetch(`/api/feedback/${feedbackId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      })

      if (res.ok) {
        setNewMessage('')
        await loadFeedback()
        router.refresh()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Erreur lors de l\'envoi du message')
    } finally {
      setSending(false)
    }
  }

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          priority,
          adminNote: adminNote.trim() || null,
          linkedIssue: linkedIssue.trim() || null,
        }),
      })

      if (res.ok) {
        await loadFeedback()
        router.refresh()
        alert('✅ Feedback mis à jour')
      }
    } catch (error) {
      console.error('Error updating feedback:', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl bg-background rounded-lg shadow-2xl z-50 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {feedback && (() => {
              const Icon = typeIcons[feedback.type] || MessageCircle
              return <Icon className="h-6 w-6 text-primary" />
            })()}
            <div>
              <h2 className="text-xl font-semibold">
                {loading ? 'Chargement...' : feedback?.title}
              </h2>
              {!loading && feedback && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={severityLabels[feedback.severity]?.color}>
                    {severityLabels[feedback.severity]?.label}
                  </Badge>
                  {!feedback.viewedAt && (
                    <Badge className="bg-blue-500">
                      Nouveau
                    </Badge>
                  )}
                  {feedback.viewedAt && feedback.status !== 'new' && (
                    <Badge className={statusLabels[feedback.status]?.color}>
                      {statusLabels[feedback.status]?.label}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !feedback ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Feedback non trouvé</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Infos générales */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                  Informations
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Auteur:</span>{' '}
                    <span className="font-medium">
                      {feedback.isAnonymous
                        ? 'Anonyme'
                        : feedback.user?.name || feedback.user?.email || 'Utilisateur supprimé'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>{' '}
                    <span className="font-medium">
                      {new Date(feedback.createdAt).toLocaleString('fr-CA')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Page:</span>{' '}
                    <span className="font-medium">{feedback.pageUrl}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Appareil:</span>{' '}
                    <span className="font-medium">
                      {feedback.deviceType || 'Non spécifié'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message principal */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                  Description
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{feedback.message}</p>
                </div>
              </div>

              {/* Screenshot */}
              {feedback.screenshot && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                    Capture d&apos;écran
                  </h3>
                  <div className="relative w-full h-80">
                    <Image
                      src={feedback.screenshot}
                      alt="Screenshot"
                      fill
                      className="rounded-lg border object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Admin controls */}
              {isSuperAdmin && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                    Gestion (Admin)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Statut</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priorité (Admin)</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedIssue">Issue GitHub liée (optionnel)</Label>
                    <input
                      id="linkedIssue"
                      type="text"
                      value={linkedIssue}
                      onChange={(e) => setLinkedIssue(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminNote">Note interne (optionnel)</Label>
                    <Textarea
                      id="adminNote"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Notes pour les admins..."
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="w-full"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      'Mettre à jour'
                    )}
                  </Button>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                  Conversation ({feedback.messages?.length || 0})
                </h3>

                {/* Messages list */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {feedback.messages?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun message pour le moment
                    </p>
                  ) : (
                    feedback.messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.authorType === 'admin'
                            ? 'bg-primary/10 ml-8'
                            : 'bg-muted mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium flex items-center gap-1">
                            {msg.authorType === 'admin' && <Shield className="h-3 w-3" />}
                            {msg.authorType === 'admin' ? 'Admin' : msg.author?.name || 'Utilisateur'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleString('fr-CA')}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* New message */}
                <div className="space-y-2">
                  <Label htmlFor="newMessage">Nouveau message</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="newMessage"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Répondre..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      size="sm"
                      className="self-end"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
