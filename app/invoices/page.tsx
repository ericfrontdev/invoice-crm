import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { InvoicesPageClient } from '@/components/invoices-page-client'

async function getInvoices(userId: string) {
  return prisma.invoice.findMany({
    where: { client: { userId } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      number: true,
      status: true,
      type: true,
      paymentMethod: true,
      paidAt: true,
      subtotal: true,
      tps: true,
      tvq: true,
      total: true,
      createdAt: true,
      dueDate: true,
      clientId: true,
      projectId: true,
      client: { select: { id: true, name: true, company: true, email: true, address: true } },
      items: { select: { id: true, description: true, amount: true, date: true, dueDate: true } },
      project: { select: { id: true, name: true } },
      _count: { select: { reminders: true } },
    },
  })
}

export default async function InvoicesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const invoices = await getInvoices(session.user.id)

  const receipts = invoices.filter((inv) => inv.type === 'receipt')
  const billableInvoices = invoices.filter((inv) => inv.type !== 'receipt')
  const projectInvoices = billableInvoices.filter((inv) => inv.project)
  const standaloneInvoices = billableInvoices.filter((inv) => !inv.project)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <InvoicesPageClient
        projectInvoices={projectInvoices}
        standaloneInvoices={standaloneInvoices}
        receipts={receipts}
      />
    </div>
  )
}
