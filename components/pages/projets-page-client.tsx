'use client'

import { ProjectsGlobalView } from '@/components/projects-global-view'
import { useTranslation } from '@/lib/i18n-context'

type Client = {
  id: string
  name: string
  company: string | null
}

type Project = {
  id: string
  name: string
  description: string | null
  status: string
  startDate: Date | null
  endDate: Date | null
  budget: number | null
  clientId: string
  createdAt: Date
  client: Client
  _count: {
    invoices: number
    files: number
  }
}

type ProjetsPageClientProps = {
  projects: Project[]
  clients: Client[]
}

export function ProjetsPageClient({ projects, clients }: ProjetsPageClientProps) {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('projects.title')}</h1>
          <p className="text-muted-foreground">
            {t('projects.manageAllProjects')}
          </p>
        </div>
      </div>

      <ProjectsGlobalView projects={projects} clients={clients} />
    </div>
  )
}
