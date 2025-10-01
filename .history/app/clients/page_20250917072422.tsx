import { prisma } from '@/lib/prisma'

async function getClients() {
  const clients = await prisma.client.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
  return clients
}

export default function ClientsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clients</h1>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          + Nouveau client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ClientsPage.map((client) => (
          <div
            key={client.id}
            className="p-6 border rounded-lg bg-card"
          >
            <h3></h3>
            <p></p>
            <p></p>
          </div>
        ))}
      </div>
    </div>
  )
}
