'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n-context'

export function PricingSuccessClient() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">{t('pricing.successTitle')}</h1>

        <p className="text-muted-foreground mb-6">
          {t('pricing.successMessage')}
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>{t('pricing.nextStep')}:</strong> {t('pricing.nextStepMessage')}
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/profil">
            <Button size="lg" className="w-full">
              {t('pricing.completeProfile')}
            </Button>
          </Link>

          <Link href="/">
            <Button size="lg" variant="outline" className="w-full">
              {t('pricing.goToDashboard')}
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          {t('pricing.confirmationEmail')}
        </p>
      </div>
    </div>
  )
}
