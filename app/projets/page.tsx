import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProjectsGlobalView } from '@/components/projects-global-view'

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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-muted-foreground">
            Gérez tous vos projets clients
          </p>
        </div>
      </div>

      <ProjectsGlobalView projects={projects} clients={clients} />
    </div>
  )
}
