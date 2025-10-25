'use client'

import { useState, useEffect } from 'react'
import {
  X,
  MessageSquare,
  Loader2,
  Bug,
  Sparkles,
  Lightbulb,
  MessageCircle,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useImageUpload } from '@/lib/upload-image'
import { useRouter } from 'next/navigation'

const feedbackTypes = [
  { value: 'bug', label: 'Bug', icon: Bug },
  { value: 'feature', label: 'Nouvelle fonctionnalité', icon: Sparkles },
  { value: 'improvement', label: 'Amélioration', icon: Lightbulb },
  { value: 'other', label: 'Autre', icon: MessageCircle },
]

const severityLevels = [
  {
    value: 'critical',
    label: 'Critique',
    description: "Bloque complètement l'utilisation",
  },
  { value: 'high', label: 'Élevé', description: 'Gêne importante' },
  { value: 'medium', label: 'Moyen', description: 'Inconvénient mineur' },
  { value: 'low', label: 'Faible', description: "Suggestion d'amélioration" },
]

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const [type, setType] = useState('bug')
  const [severity, setSeverity] = useState('medium')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const { upload, uploading } = useImageUpload()
  const router = useRouter()

  // Check if feedback system is enabled
  useEffect(() => {
    const checkEnabled = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const settings = await res.json()
          setIsEnabled(settings.feedbackSystemEnabled)
        }
      } catch (error) {
        // Si erreur, on suppose que c'est désactivé
        setIsEnabled(false)
      }
    }
    checkEnabled()
  }, [])

  const handleScreenshotChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Upload immédiatement
    const result = await upload(file)
    if (result) {
      setScreenshotUrl(result.url)
    }
  }

  const captureContext = () => {
    return {
      pageUrl: window.location.href,
      pageTitle: document.title,
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      deviceType:
        window.innerWidth < 768
          ? 'mobile'
          : window.innerWidth < 1024
            ? 'tablet'
            : 'desktop',
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      return
    }

    setSubmitting(true)

    try {
      const context = captureContext()

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          severity,
          title: title.trim(),
          message: message.trim(),
          screenshot: screenshotUrl,
          isAnonymous,
          ...context,
        }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de l'envoi")
      }

      // Success!
      setSuccess(true)

      // Reset form after 2s
      setTimeout(() => {
        setIsOpen(false)
        setType('bug')
        setSeverity('medium')
        setTitle('')
        setMessage('')
        setIsAnonymous(false)
        setScreenshotUrl(null)
        setSuccess(false)
      }, 2000)

      // Refresh router cache
      router.refresh()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert("Erreur lors de l'envoi du feedback. Veuillez réessayer.")
    } finally {
      setSubmitting(false)
    }
  }

  // Ne rien afficher si désactivé
  if (!isEnabled) {
    return null
  }

  return (
    <>
      {/* Spacer pour éviter que le contenu soit caché par le bouton mobile */}
      {!isOpen && <div className="md:hidden h-14" />}

      {/* Tab flottante - Desktop */}
      {!isOpen && (
        <>
          {/* Version desktop - bouton vertical sur le côté */}
          <button
            onClick={() => setIsOpen(true)}
            className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-2 py-6 rounded-l-lg shadow-lg hover:bg-primary/90 transition-all z-50 items-center gap-2 font-medium"
            style={{ writingMode: 'vertical-rl' }}
          >
            <MessageSquare
              className="h-5 w-5"
              style={{ writingMode: 'horizontal-tb' }}
            />
            <span>Feedback</span>
          </button>

          {/* Version mobile - bannière sticky en bas */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground px-4 py-3 shadow-lg hover:bg-primary/90 transition-all z-50 flex items-center justify-center gap-2 font-medium"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Envoyer un feedback</span>
          </button>
        </>
      )}

      {/* Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-background shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-semibold">
                  💬 Partagez votre feedback
                </h2>
                <p className="text-sm text-muted-foreground">
                  Aidez-nous à améliorer SoloPack
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Success message */}
            {success && (
              <div className="mx-6 mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-medium text-center">
                  ✅ Merci pour votre feedback!
                </p>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6"
            >
              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type de feedback *</Label>
                <Select
                  value={type}
                  onValueChange={setType}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackTypes.map((t) => (
                      <SelectItem
                        key={t.value}
                        value={t.value}
                      >
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Severity */}
              <div className="space-y-2">
                <Label htmlFor="severity">Urgence *</Label>
                <Select
                  value={severity}
                  onValueChange={setSeverity}
                >
                  <SelectTrigger id="severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severityLevels.map((s) => (
                      <SelectItem
                        key={s.value}
                        value={s.value}
                        className="py-3"
                      >
                        <div className="text-left w-full py-1">
                          <div>{s.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {s.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Résumé en quelques mots..."
                  maxLength={100}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/100 caractères
                </p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Description détaillée *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez le problème ou votre suggestion en détail..."
                  rows={5}
                  required
                />
              </div>

              {/* Screenshot */}
              <div className="space-y-2">
                <Label htmlFor="screenshot">
                  Capture d&apos;écran (optionnel)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {screenshotUrl && (
                  <div className="mt-2 relative w-full h-40">
                    <Image
                      src={screenshotUrl}
                      alt="Screenshot preview"
                      fill
                      className="rounded-lg border object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotUrl(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Anonymous */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) =>
                    setIsAnonymous(checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="anonymous"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Envoyer anonymement
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Votre identité ne sera pas associée à ce feedback
                  </p>
                </div>
              </div>

              {/* Context info */}
              <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">
                  Informations capturées automatiquement:
                </p>
                <p>
                  • Page actuelle:{' '}
                  {typeof window !== 'undefined'
                    ? window.location.pathname
                    : ''}
                </p>
                <p>
                  • Navigateur:{' '}
                  {typeof window !== 'undefined'
                    ? navigator.userAgent.split(' ').slice(-2).join(' ')
                    : ''}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={submitting || !title.trim() || !message.trim()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    'Envoyer'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  )
}
