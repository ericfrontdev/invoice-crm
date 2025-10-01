import { prisma } from '@/lib/prisma'
import { ClientsView } from '@/app/clients/clients-view'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

async function getClients(userId: string) {
  const clients = await prisma.client.findMany({
    where: { userId },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return clients
}

export default async function ClientsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const clients = await getClients(session.user.id)

  return <ClientsView clients={clients} />
}
