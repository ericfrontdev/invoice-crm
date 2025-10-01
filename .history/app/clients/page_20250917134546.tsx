import { prisma } from '@/lib/prisma'
import { ClientsView } from '@/app/clients/clients-view'

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
