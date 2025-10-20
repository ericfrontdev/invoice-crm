import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ClientsGrid } from '@/components/clients-grid'

async function getClients(userId: string) {
  return await prisma.client.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
    },
  })
}

export default async function CRMPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const clients = await getClients(session.user.id)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold">CRM Clients</h1>
        <p className="text-muted-foreground mt-2">
          Cliquer sur un client pour ouvrir sa section CRM
        </p>
      </div>

      {/* Grille de clients */}
      <ClientsGrid clients={clients} />
    </div>
  )
}
