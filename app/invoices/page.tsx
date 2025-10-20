import { prisma } from '@/lib/prisma'
import { InvoicesTable } from '@/components/invoices-table'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Factures</h1>
          <p className="text-muted-foreground">
            Gérez toutes vos factures clients
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Aucune facture pour l&apos;instant.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Factures de projets */}
          {projectInvoices.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Factures de projets</h2>
                <span className="text-sm text-muted-foreground">
                  ({projectInvoices.length})
                </span>
              </div>
              <InvoicesTable invoices={projectInvoices} showProject />
            </div>
          )}

          {/* Factures ponctuelles */}
          {standaloneInvoices.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Factures ponctuelles</h2>
                <span className="text-sm text-muted-foreground">
                  ({standaloneInvoices.length})
                </span>
              </div>
              <InvoicesTable invoices={standaloneInvoices} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
