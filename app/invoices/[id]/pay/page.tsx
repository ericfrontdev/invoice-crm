import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { InvoicePayPageClient } from '@/components/pages/invoice-pay-page-client'

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
  return <InvoicePayPageClient invoice={invoice} />
}
