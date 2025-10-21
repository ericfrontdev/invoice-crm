import { prisma } from '@/lib/prisma'
import { ClientsView } from '@/app/clients/clients-view'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

async function getClients(userId: string, showArchived: boolean = false) {
  const clients = await prisma.client.findMany({
    where: {
      userId,
      archived: showArchived ? true : false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return clients
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const params = await searchParams
  const showArchived = params.archived === 'true'
  const clients = await getClients(session.user.id, showArchived)

  return <ClientsView clients={clients} showArchived={showArchived} />
}
