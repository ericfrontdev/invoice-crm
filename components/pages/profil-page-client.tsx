'use client'

import { ProfileForm } from '@/components/profile-form'
import Link from 'next/link'
import { MessageSquare, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/lib/i18n-context'

type User = {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  address: string | null
  neq: string | null
  tpsNumber: string | null
  tvqNumber: string | null
  chargesTaxes: boolean
  paymentProvider: string | null
  paypalEmail: string | null
  stripeSecretKey: string | null
  logo: string | null
  autoRemindersEnabled: boolean
  reminderMiseEnDemeureTemplate: string | null
  plan: string | null
  subscriptionStatus: string | null
  subscriptionEndsAt: Date | null
}

type ProfilPageClientProps = {
  user: User
  feedbackSystemEnabled: boolean
}

export function ProfilPageClient({ user, feedbackSystemEnabled }: ProfilPageClientProps) {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('profile.myProfile')}</h1>
          <p className="text-muted-foreground">
            {t('profile.managePersonalInfo')}
          </p>
        </div>

        {/* Quick Links - Only show if feedback system is enabled */}
        {feedbackSystemEnabled && (
          <div className="mb-6">
            <Link
              href="/profil/mes-feedbacks"
              className="flex items-center justify-between p-4 bg-card rounded-lg border hover:border-primary transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{t('profile.myFeedbacks')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('profile.viewFeedbackHistory')}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
        )}

        <ProfileForm user={user} />
      </div>
    </div>
  )
}
