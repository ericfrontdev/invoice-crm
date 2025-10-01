import { prisma } from '@/lib/prisma'
import { ClientCard } from '@/components/client-card'

async function getClients() {
  const clients = await prisma.client.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
  return clients
}

export default async function ClientsPage() {
  const clients = await getClients()

  return <ClientsView clients={clients} />
}
