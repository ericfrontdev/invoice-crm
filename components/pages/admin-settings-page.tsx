'use client'

import { useTranslation } from '@/lib/i18n-context'
import { SettingsForm } from '@/components/admin/settings-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type Settings = {
  id: string
  feedbackSystemEnabled: boolean
  betaEnabled: boolean
  betaEndDate: Date | null
  maxBetaUsers: number
  updatedAt: Date
  updatedBy: string | null
}

export function AdminSettingsPage({ settings }: { settings: Settings }) {
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
        <h1 className="text-3xl font-bold mb-2">{t('admin.systemSettings')}</h1>
        <p className="text-muted-foreground">
          {t('admin.globalAppConfiguration')}
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  )
}
