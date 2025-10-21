import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ThemeLogo } from '@/components/theme-logo'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getInvoice(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: {
      id: true,
      number: true,
      status: true,
      total: true,
      paidAt: true,
      client: {
        select: {
          name: true,
          user: {
            select: {
              name: true,
              company: true,
            },
          },
        },
      },
    },
  })

  if (!invoice) {
    notFound()
  }

  return invoice
}

export default async function PaymentSuccessPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const invoice = await getInvoice(params.id)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <ThemeLogo width={200} height={50} className="mx-auto mb-4" />
        </div>

        <div className="bg-card border rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <svg
                className="w-10 h-10 text-green-600 dark:text-green-400"
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
            <h1 className="text-3xl font-bold mb-2">Paiement réussi!</h1>
            <p className="text-muted-foreground text-lg">
              Merci pour votre paiement
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Facture</span>
                <span className="font-medium">{invoice.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant payé</span>
                <span className="font-semibold text-lg">{invoice.total.toFixed(2)} $</span>
              </div>
              {invoice.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date de paiement</span>
                  <span className="font-medium">
                    {new Intl.DateTimeFormat('fr-FR', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    }).format(new Date(invoice.paidAt))}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut</span>
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Payée
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Un courriel de confirmation a été envoyé à {invoice.client.name}.
              <br />
              Merci d&apos;avoir fait affaire avec{' '}
              {invoice.client.user.company || invoice.client.user.name}!
            </p>
          </div>

          <div className="flex justify-center mt-6">
            <Link href={`/invoices/${invoice.id}/pay`}>
              <Button variant="outline" className="cursor-pointer">
                Voir la facture
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground mt-6">
          <p>Powered by SoloPack</p>
        </div>
      </div>
    </div>
  )
}
