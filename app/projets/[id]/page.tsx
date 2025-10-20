import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Calendar, DollarSign, FileText, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectActions } from '@/components/project-actions'

async function getProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      client: { userId },
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
        },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      },
      files: {
        orderBy: { uploadedAt: 'desc' },
      },
      _count: {
        select: {
          invoices: true,
          files: true,
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  return project
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300',
  onhold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-300',
}

const statusLabels = {
  active: 'Actif',
  completed: 'Terminé',
  onhold: 'En pause',
  cancelled: 'Annulé',
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const { id } = await params
  const project = await getProject(id, session.user.id)

  const totalInvoiced = project.invoices.reduce((sum, inv) => sum + inv.total, 0)

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux projets
          </Button>
        </Link>
      </div>

      {/* Project Info */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[project.status as keyof typeof statusColors]
                }`}
              >
                {statusLabels[project.status as keyof typeof statusLabels]}
              </span>
            </div>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Client:</span>
          <Link href={`/clients/${project.client.id}`} className="underline">
            {project.client.company || project.client.name}
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="flex flex-wrap gap-4 pt-4 border-t items-end">
          <div className="flex-1 min-w-[150px]">
            {project.budget && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget</span>
                </div>
                <p className="text-2xl font-semibold">{project.budget.toFixed(2)} $</p>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Facturé</span>
              </div>
              <p className="text-2xl font-semibold">{totalInvoiced.toFixed(2)} $</p>
            </div>
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Factures</span>
              </div>
              <p className="text-2xl font-semibold">{project._count.invoices}</p>
            </div>
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Paperclip className="h-4 w-4" />
                <span>Fichiers</span>
              </div>
              <p className="text-2xl font-semibold">{project._count.files}</p>
            </div>
          </div>
          <div className="space-y-1 ml-auto">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Actions</span>
            </div>
            <ProjectActions project={project} clientId={project.client.id} />
          </div>
        </div>

        {/* Dates */}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-4 pt-4 border-t text-sm">
            {project.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Début:</span>
                <span>
                  {new Date(project.startDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
            {project.endDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Fin:</span>
                <span>
                  {new Date(project.endDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invoices */}
      {project.invoices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Factures du projet</h2>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4">Numéro</th>
                  <th className="text-left py-3 px-4">Statut</th>
                  <th className="text-right py-3 px-4">Montant</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {project.invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t">
                    <td className="py-3 px-4 font-medium">{invoice.number}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                          invoice.status === 'paid'
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-400/10 dark:text-green-300 dark:border-green-300/20'
                            : invoice.status === 'sent'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-300/20'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-300/20'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {invoice.total.toFixed(2)} $
                    </td>
                    <td className="py-3 px-4">
                      {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Files */}
      {project.files.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Fichiers</h2>
          <div className="grid grid-cols-1 gap-3">
            {project.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{file.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.fileSize / 1024).toFixed(1)} KB •{' '}
                      {new Date(file.uploadedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Button variant="ghost" size="sm">
                    Ouvrir
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
