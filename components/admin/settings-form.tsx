'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save } from 'lucide-react'

type Settings = {
  id: string
  feedbackSystemEnabled: boolean
  betaEndDate: Date | null
  updatedAt: Date
  updatedBy: string | null
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter()
  const [feedbackEnabled, setFeedbackEnabled] = useState(settings.feedbackSystemEnabled)
  const [betaEndDate, setBetaEndDate] = useState(
    settings.betaEndDate ? new Date(settings.betaEndDate).toISOString().split('T')[0] : ''
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackSystemEnabled: feedbackEnabled,
          betaEndDate: betaEndDate || null,
        }),
      })

      if (res.ok) {
        router.refresh()
        alert('Paramètres sauvegardés!')
      } else {
        alert('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Feedback System */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Système de feedback</h2>
          <p className="text-sm text-muted-foreground">
            Contrôlez la visibilité du widget de feedback pour tous les utilisateurs
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="feedback-enabled" className="cursor-pointer">
            Widget de feedback activé
          </Label>
          <Switch
            id="feedback-enabled"
            checked={feedbackEnabled}
            onCheckedChange={setFeedbackEnabled}
          />
        </div>
      </div>

      {/* Beta End Date */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Fin de la période bêta</h2>
          <p className="text-sm text-muted-foreground">
            Définissez une date après laquelle l&apos;application sera automatiquement bloquée pour tous les utilisateurs non-abonnés
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="beta-end-date">Date de fin de bêta</Label>
          <Input
            id="beta-end-date"
            type="date"
            value={betaEndDate}
            onChange={(e) => setBetaEndDate(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Laissez vide pour désactiver la limitation. Une fois cette date passée, seuls les utilisateurs avec un abonnement actif pourront accéder à l&apos;application.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        size="lg"
        className="w-full sm:w-auto"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sauvegarde...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les paramètres
          </>
        )}
      </Button>
    </div>
  )
}
