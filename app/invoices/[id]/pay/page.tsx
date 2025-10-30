import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ThemeLogo } from '@/components/theme-logo'
import { PaymentButton } from '@/components/payment-button'

async function getInvoice(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          name: true,
          email: true,
          company: true,
          address: true,
          user: {
            select: {
              name: true,
              company: true,
              paymentProvider: true,
              paypalEmail: true,
            },
          },
        },
      },
      items: {
        orderBy: { date: 'asc' },
      },
    },
  })

  if (!invoice) {
    notFound()
  }

  return invoice
}

export default async function InvoicePayPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const invoice = await getInvoice(params.id)

  // Si la facture est déjà payée
  if (invoice.status === 'paid') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <ThemeLogo width={200} height={50} className="mx-auto mb-4" />
          </div>

          <div className="bg-card border rounded-xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Facture déjà payée</h1>
            <p className="text-muted-foreground">
              Cette facture a été payée le{' '}
              {invoice.paidAt
                ? new Intl.DateTimeFormat('fr-FR').format(new Date(invoice.paidAt))
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Si le provider n'a pas configuré de moyen de paiement
  if (!invoice.client.user.paymentProvider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <ThemeLogo width={200} height={50} className="mx-auto mb-4" />
          </div>

          <div className="bg-card border rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Paiement non disponible</h1>
            <p className="text-muted-foreground">
              Le paiement en ligne n&apos;est pas encore configuré pour cette facture.
              Veuillez contacter {invoice.client.user.name} pour plus d&apos;informations.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const hasTaxes = invoice.tps > 0 || invoice.tvq > 0

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <ThemeLogo width={200} height={50} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Paiement de facture</h1>
          <p className="text-muted-foreground">
            Facture {invoice.number}
          </p>
        </div>

        <div className="bg-card border rounded-xl shadow-lg p-6 mb-6">
          {/* Header facture */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-muted-foreground mb-1">De</p>
              {invoice.client.user.company && (
                <p className="font-semibold text-base">{invoice.client.user.company}</p>
              )}
              <p className="text-sm">{invoice.client.user.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">À</p>
              <p className="font-medium">{invoice.client.name}</p>
              {invoice.client.company && <p className="text-sm">{invoice.client.company}</p>}
              {invoice.client.address && <p className="text-sm">{invoice.client.address}</p>}
              <p className="text-sm">{invoice.client.email}</p>
            </div>
          </div>

          {/* Items */}
          <div className="overflow-x-auto rounded-lg border mb-6">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-right py-3 px-4">Montant</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="py-3 px-4">{item.description}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' }).format(
                        new Date(item.date)
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {item.amount.toFixed(2)} $
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {hasTaxes && (
                  <tr className="border-t">
                    <td className="py-3 px-4" colSpan={2}>
                      <span className="text-sm text-muted-foreground">Sous-total</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {invoice.subtotal.toFixed(2)} $
                    </td>
                  </tr>
                )}
                {hasTaxes && invoice.tps > 0 && (
                  <tr>
                    <td className="py-3 px-4" colSpan={2}>
                      <span className="text-sm text-muted-foreground">TPS (5%)</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {invoice.tps.toFixed(2)} $
                    </td>
                  </tr>
                )}
                {hasTaxes && invoice.tvq > 0 && (
                  <tr>
                    <td className="py-3 px-4" colSpan={2}>
                      <span className="text-sm text-muted-foreground">TVQ (9,975%)</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {invoice.tvq.toFixed(2)} $
                    </td>
                  </tr>
                )}
                <tr className="border-t">
                  <td className="py-3 px-4" colSpan={2}>
                    <span className="text-base font-semibold">Total à payer</span>
                  </td>
                  <td className="py-3 px-4 text-right text-2xl font-bold text-primary">
                    {invoice.total.toFixed(2)} $
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bouton de paiement */}
          <div className="flex justify-center pt-4">
            <PaymentButton
              invoiceId={invoice.id}
              total={invoice.total}
              invoiceNumber={invoice.number}
              paymentProvider={invoice.client.user.paymentProvider}
              paypalEmail={invoice.client.user.paypalEmail}
            />
          </div>

          <div className="text-center text-sm text-muted-foreground mt-6">
            <p>Conditions de paiement: Payable à réception.</p>
            <p className="mt-2">
              Pour toute question, veuillez contacter {invoice.client.user.name}.
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>Powered by SoloPack</p>
        </div>
      </div>
    </div>
  )
}
