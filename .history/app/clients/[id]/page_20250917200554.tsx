import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

async function getClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      unpaidAmounts: {
        where: { status: 'unpaid' },
        orderBy: { date: 'desc' },
      },
    },
  })

  if (!client) {
    notFound()
  }

  return client
}

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const client = await getClient(params.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card rounded-lg border p-6 mb-4">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        {client.company && (
          <p className="text-muted-foreground">{client.company}</p>
        )}
        <p>{client.email}</p>
      </div>
      <div className="bg-muted/50 border rounded-lg p-6">
        <p>Page détail client - en construction</p>
        <p>Montants dus : {client.unpaidAmounts.length}</p>
      </div>
    </div>
  )
}
