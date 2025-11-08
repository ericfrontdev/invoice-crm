import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { ClientDetailPageClient } from '@/components/pages/client-detail-page-client'

async function getClient(id: string, userId: string) {
  const client = await prisma.client.findUnique({
    where: { id, userId },
    include: {
      unpaidAmounts: {
        where: { status: 'unpaid' },
        orderBy: { date: 'desc' },
        select: {
          id: true,
          amount: true,
          description: true,
          date: true,
          dueDate: true,
          status: true,
        },
      },
      user: {
        select: {
          name: true,
          company: true,
          chargesTaxes: true,
        },
      },
    },
  })

  if (!client) {
    notFound()
  }

  return client
}

export default async function ClientDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const params = await props.params
  const client = await getClient(params.id, session.user.id)

  return <ClientDetailPageClient client={client} />
}
