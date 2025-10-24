import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReminderTimeline } from '@/components/reminder-timeline'

export const revalidate = 0

async function getInvoiceWithReminders(invoiceId: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      client: {
        userId,
      },
    },
    include: {
      client: {
        select: {
          name: true,
          company: true,
          email: true,
        },
      },
      reminders: {
        orderBy: {
          sentAt: 'asc',
        },
      },
    },
  })

  if (!invoice) {
    notFound()
  }

  return invoice
}

export default async function InvoiceRemindersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const { id } = await params
  const invoice = await getInvoiceWithReminders(id, session.user.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/invoices">
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour vers factures
          </Button>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Historique des rappels
        </h1>
        <p className="text-muted-foreground">
          Facture {invoice.number} - {invoice.client.company || invoice.client.name}
        </p>
      </div>

      <ReminderTimeline
        invoice={invoice}
        reminders={invoice.reminders}
      />
    </div>
  )
}
