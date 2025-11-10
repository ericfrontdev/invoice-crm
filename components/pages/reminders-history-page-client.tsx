'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n-context'

type Reminder = {
  id: string
  type: string
  sentAt: Date
  sentTo: string
  status: string
  invoice: {
    id: string
    number: string
    total: number
    client: {
      name: string
      company: string | null
    }
  }
}

type RemindersHistoryPageClientProps = {
  reminders: Reminder[]
}

export function RemindersHistoryPageClient({ reminders }: RemindersHistoryPageClientProps) {
  const { t, locale } = useTranslation()

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'reminder1':
        return t('reminders.reminder1')
      case 'reminder2':
        return t('reminders.reminder2')
      case 'reminder3':
        return t('reminders.reminder3')
      case 'mise_en_demeure':
        return t('reminders.miseDemeure')
      default:
        return type
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/invoices">
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">{t('reminders.title')}</h1>

      {reminders.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('reminders.noReminders')}</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">{t('common.date')}</th>
                  <th className="text-left p-4 font-semibold">{t('common.type')}</th>
                  <th className="text-left p-4 font-semibold">{t('invoices.title')}</th>
                  <th className="text-left p-4 font-semibold">{t('dashboard.client')}</th>
                  <th className="text-right p-4 font-semibold">{t('common.amount')}</th>
                  <th className="text-center p-4 font-semibold">{t('common.status')}</th>
                  <th className="text-left p-4 font-semibold">{t('reminders.sentTo')}</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((reminder) => (
                  <tr key={reminder.id} className="border-t hover:bg-muted/50">
                    <td className="p-4">
                      {new Date(reminder.sentAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium">
                        {getReminderTypeLabel(reminder.type)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/factures/${reminder.invoice.id}/rappels`}
                        className="text-primary hover:underline font-medium"
                      >
                        {reminder.invoice.number}
                      </Link>
                    </td>
                    <td className="p-4">
                      {reminder.invoice.client.company || reminder.invoice.client.name}
                    </td>
                    <td className="p-4 text-right font-medium">
                      {reminder.invoice.total.toFixed(2)} $
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {reminder.status === 'sent' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-700 dark:text-green-400">{t('reminders.sent')}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-700 dark:text-red-400">{t('common.error')}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {reminder.sentTo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
