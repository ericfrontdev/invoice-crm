import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClientDetailView } from '@/components/client-detail-view'

async function getClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
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
    <div className="overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <div className="mb-6">
          <Link href="/clients">
            <Button
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux clients
            </Button>
          </Link>
        </div>
      </div>

      <ClientDetailView client={client} />
    </div>
  )
}
