import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const revalidate = 0

async function getReminders(userId: string) {
  const reminders = await prisma.invoiceReminder.findMany({
    where: {
      invoice: {
        client: {
          userId,
        },
      },
    },
    include: {
      invoice: {
        select: {
          id: true,
          number: true,
          total: true,
          client: {
            select: {
              name: true,
              company: true,
            },
          },
        },
      },
    },
    orderBy: {
      sentAt: 'desc',
    },
  })

  return reminders
}

const reminderTypeLabels = {
  reminder1: 'Rappel 1 - Amical',
  reminder2: 'Rappel 2 - Neutre',
  reminder3: 'Rappel 3 - Ferme',
  mise_en_demeure: 'Mise en demeure',
}

export default async function RemindersHistoryPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const reminders = await getReminders(session.user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/invoices">
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour vers factures
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Historique des rappels de paiement</h1>

      {reminders.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun rappel envoyé pour le moment.</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Facture</th>
                  <th className="text-left p-4 font-semibold">Client</th>
                  <th className="text-right p-4 font-semibold">Montant</th>
                  <th className="text-center p-4 font-semibold">Statut</th>
                  <th className="text-left p-4 font-semibold">Destinataire</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((reminder) => (
                  <tr key={reminder.id} className="border-t hover:bg-muted/50">
                    <td className="p-4">
                      {new Date(reminder.sentAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium">
                        {reminderTypeLabels[reminder.type as keyof typeof reminderTypeLabels] || reminder.type}
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
                            <span className="text-sm text-green-700 dark:text-green-400">Envoyé</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-700 dark:text-red-400">Erreur</span>
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
