import { prisma } from '@/lib/prisma'
import { InvoicesTable } from '@/components/invoices-table'

async function getInvoices() {
  try {
    return await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, company: true, email: true, address: true } },
        items: { select: { id: true, description: true, amount: true, date: true, dueDate: true } },
      },
    })
  } catch (e) {
    // Fallback when items relation isn't available yet (pre-migration)
    return prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, company: true, email: true, address: true } },
      },
    })
  }
}

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Factures</h1>
        {/* Placeholder actions */}
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Aucune facture pour l'instant.
        </div>
      ) : (
        <InvoicesTable invoices={invoices as any} />
      )}
    </div>
  )
}
