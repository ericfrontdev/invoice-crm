import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProjetsPageClient } from '@/components/pages/projets-page-client'

async function getProjects(userId: string) {
  const projects = await prisma.project.findMany({
    where: {
      client: {
        userId,
      },
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          company: true,
        },
      },
      _count: {
        select: {
          invoices: true,
          files: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return projects
}

async function getClients(userId: string) {
  const clients = await prisma.client.findMany({
    where: {
      userId,
      archived: false, // Seulement les clients actifs
    },
    select: {
      id: true,
      name: true,
      company: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return clients
}

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const projects = await getProjects(session.user.id)
  const clients = await getClients(session.user.id)

  return <ProjetsPageClient projects={projects} clients={clients} />
}
