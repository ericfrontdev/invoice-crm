'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save } from 'lucide-react'
import { useTranslation } from '@/lib/i18n-context'

type Settings = {
  id: string
  feedbackSystemEnabled: boolean
  betaEndDate: Date | null
  updatedAt: Date
  updatedBy: string | null
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const { t } = useTranslation()
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
        alert(t('admin.settingsSaved'))
      } else {
        alert(t('admin.saveError'))
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert(t('admin.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Feedback System */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">{t('admin.feedbackSystemTitle')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('admin.feedbackSystemDescription')}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="feedback-enabled" className="cursor-pointer">
            {t('admin.feedbackWidgetEnabled')}
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
          <h2 className="text-lg font-semibold mb-1">{t('admin.betaEndTitle')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('admin.betaEndDescription')}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="beta-end-date">{t('admin.betaEndDateLabel')}</Label>
          <Input
            id="beta-end-date"
            type="date"
            value={betaEndDate}
            onChange={(e) => setBetaEndDate(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {t('admin.betaEndDateHint')}
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
            {t('admin.saving')}
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            {t('admin.saveSettings')}
          </>
        )}
      </Button>
    </div>
  )
}
