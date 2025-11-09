'use client'

import { useTranslation } from '@/lib/i18n-context'
import { SettingsForm } from '@/components/admin/settings-form'

type Settings = {
  id: string
  feedbackSystemEnabled: boolean
  betaEndDate: Date | null
  updatedAt: Date
  updatedBy: string | null
}

export function AdminSettingsPage({ settings }: { settings: Settings }) {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('admin.systemSettings')}</h1>
        <p className="text-muted-foreground">
          {t('admin.globalAppConfiguration')}
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  )
}
