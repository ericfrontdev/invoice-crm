import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClientCRMView } from '@/components/client-crm-view'
import { auth } from '@/auth'

// Désactiver le cache pour toujours avoir les données fraîches
export const revalidate = 0

async function getClientWithCRMData(id: string, userId: string) {
  const client = await prisma.client.findUnique({
    where: { id, userId },
    include: {
      projects: {
        include: {
          invoices: {
            select: {
              id: true,
              number: true,
              subtotal: true,
              tps: true,
              tvq: true,
              total: true,
              status: true,
            },
          },
          files: {
            select: {
              id: true,
              filename: true,
              fileSize: true,
              mimeType: true,
              uploadedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          number: true,
          status: true,
          subtotal: true,
          tps: true,
          tvq: true,
          total: true,
          createdAt: true,
          dueDate: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      unpaidAmounts: {
        where: { status: 'unpaid' },
        select: {
          amount: true,
          dueDate: true,
        },
      },
      notes: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!client) {
    notFound()
  }

  return client
}

export default async function ClientCRMPage(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ createProject?: string; tab?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const params = await props.params
  const searchParams = await props.searchParams
  const client = await getClientWithCRMData(params.id, session.user.id)

  return (
    <div className="overflow-x-visible">
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <div className="mb-6">
          <Link href="/clients">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux clients
            </Button>
          </Link>
        </div>

        <ClientCRMView
          client={client}
          openProjectModal={searchParams.createProject === 'true'}
          initialTab={searchParams.tab}
        />
      </div>
    </div>
  )
}
