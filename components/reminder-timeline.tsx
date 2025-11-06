'use client'

import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n-context'

type Reminder = {
  id: string
  type: string
  sentAt: Date
  sentTo: string
  status: string
  errorMessage: string | null
}

type Invoice = {
  id: string
  number: string
  dueDate: Date | null
}

export function ReminderTimeline({
  invoice,
  reminders,
}: {
  invoice: Invoice
  reminders: Reminder[]
}) {
  const { t } = useTranslation()

  const reminderSteps = [
    {
      type: 'reminder1',
      label: t('reminders.reminder1'),
      dayOffset: -3,
    },
    {
      type: 'reminder2',
      label: t('reminders.reminder2'),
      dayOffset: 1,
    },
    {
      type: 'reminder3',
      label: t('reminders.reminder3'),
      dayOffset: 7,
    },
    {
      type: 'mise_en_demeure',
      label: t('reminders.miseDemeure'),
      dayOffset: 14,
    },
  ]
  // Calculer les dates programmées
  const scheduledDates: Record<string, Date> = {}
  if (invoice.dueDate) {
    const dueDate = new Date(invoice.dueDate)
    reminderSteps.forEach((step) => {
      const date = new Date(dueDate)
      date.setDate(date.getDate() + step.dayOffset)
      scheduledDates[step.type] = date
    })
  }

  // Créer un map des rappels envoyés par type
  const sentRemindersMap: Record<string, Reminder> = {}
  reminders.forEach((reminder) => {
    sentRemindersMap[reminder.type] = reminder
  })

  return (
    <div className="bg-card rounded-lg border p-8">
      <div className="max-w-2xl mx-auto">
        {reminderSteps.map((step, index) => {
          const reminder = sentRemindersMap[step.type]
          const scheduledDate = scheduledDates[step.type]
          const isLast = index === reminderSteps.length - 1

          let status: 'sent' | 'error' | 'pending' = 'pending'
          if (reminder) {
            status = reminder.status === 'sent' ? 'sent' : 'error'
          }

          return (
            <div key={step.type} className="relative">
              {/* Ligne verticale */}
              {!isLast && (
                <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
              )}

              {/* Step */}
              <div className="flex gap-4 pb-8">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {status === 'sent' ? (
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  ) : status === 'error' ? (
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-lg mb-1">{step.label}</h3>

                  {status === 'sent' && reminder && (
                    <div className="text-sm space-y-1">
                      <p className="text-green-700 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {t('reminders.sentOn')}{' '}
                        {new Date(reminder.sentAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}{' '}
                        à{' '}
                        {new Date(reminder.sentAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-muted-foreground">{t('reminders.sentTo')}: {reminder.sentTo}</p>
                    </div>
                  )}

                  {status === 'error' && reminder && (
                    <div className="text-sm space-y-1">
                      <p className="text-red-700 dark:text-red-400 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        {t('reminders.sendError')}
                      </p>
                      {reminder.errorMessage && (
                        <p className="text-muted-foreground text-xs">
                          {reminder.errorMessage}
                        </p>
                      )}
                      <p className="text-muted-foreground">
                        {t('reminders.attemptedOn')}{' '}
                        {new Date(reminder.sentAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}

                  {status === 'pending' && scheduledDate && (
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {t('reminders.scheduled')}{' '}
                        {scheduledDate.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}

                  {status === 'pending' && !scheduledDate && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        {t('reminders.notScheduled')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
