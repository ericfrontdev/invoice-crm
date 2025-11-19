'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeLogo } from '@/components/theme-logo'
import { useTranslation } from '@/lib/i18n-context'
import { Users, CheckCircle2, Clock } from 'lucide-react'

export default function WaitlistPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Si l'erreur est une clé de traduction, on la traduit
        const errorKey = data.error
        const errorMessage = errorKey?.startsWith('waitlist.')
          ? t(errorKey)
          : (errorKey || t('errors.generic'))
        setError(errorMessage)
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50 dark:from-slate-950 dark:to-slate-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-background rounded-xl border shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <ThemeLogo className="w-auto" />
            </div>

            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t('waitlist.successTitle')}</h1>
              <p className="text-muted-foreground">
                {t('waitlist.successMessage')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t('waitlist.nextSteps')}
                </p>
              </div>

              <Link href="/">
                <Button className="w-full">
                  {t('waitlist.backToHome')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-background rounded-xl border shadow-lg p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <ThemeLogo className="w-auto" />
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Users className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {t('waitlist.title')}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t('waitlist.subtitle')}
            </p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">{t('waitlist.limitedSpots')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('waitlist.limitedSpotsDesc')}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">{t('waitlist.earlyAccess')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('waitlist.earlyAccessDesc')}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2"
              >
                {t('waitlist.name')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder={t('waitlist.namePlaceholder')}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
              >
                {t('waitlist.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder={t('waitlist.emailPlaceholder')}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? t('waitlist.joining') : t('waitlist.joinWaitlist')}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('waitlist.alreadyHaveAccess')}{' '}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
