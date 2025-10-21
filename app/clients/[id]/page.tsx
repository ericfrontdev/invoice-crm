import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClientDetailView } from '@/components/client-detail-view'
import { auth } from '@/auth'

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

  return (
    <div className="overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <div className="mb-6">
          <Link href="/clients">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
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
