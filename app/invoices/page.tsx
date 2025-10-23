import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { InvoicesPageClient } from '@/components/invoices-page-client'
import { Suspense } from 'react'

async function getInvoices(userId: string) {
  try {
    return await prisma.invoice.findMany({
      where: { client: { userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, company: true, email: true, address: true } },
        items: { select: { id: true, description: true, amount: true, date: true, dueDate: true } },
        project: { select: { id: true, name: true } },
      },
    })
  } catch {
    // Fallback when items relation isn't available yet (pre-migration)
    return prisma.invoice.findMany({
      where: { client: { userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, company: true, email: true, address: true } },
        project: { select: { id: true, name: true } },
      },
    })
  }
}

export default async function InvoicesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const invoices = await getInvoices(session.user.id)

  const projectInvoices = invoices.filter((inv) => inv.project)
  const standaloneInvoices = invoices.filter((inv) => !inv.project)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Suspense fallback={<div>Chargement...</div>}>
        <InvoicesPageClient
          projectInvoices={projectInvoices}
          standaloneInvoices={standaloneInvoices}
        />
      </Suspense>
    </div>
  )
}
