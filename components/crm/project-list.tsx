'use client'

import { Button } from '@/components/ui/button'
import { Edit, Trash2, Plus, Upload } from 'lucide-react'

type Project = {
  id: string
  name: string
  status: string
  budget: number | null
  startDate: Date | null
  endDate: Date | null
  invoices: Array<{ total: number }>
  files: Array<{ id: string }>
}

const statusLabels = {
  active: 'Actif',
  completed: 'Terminé',
  paused: 'En pause',
  cancelled: 'Annulé',
}

export function ProjectList({
  projects,
  onEdit,
  onDelete,
  onCreateInvoice,
  onUploadDocuments,
}: {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
  onCreateInvoice: (project: Project) => void
  onUploadDocuments: (project: Project) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium">Nom</th>
            <th className="text-left p-3 font-medium">Statut</th>
            <th className="text-left p-3 font-medium">Budget</th>
            <th className="text-left p-3 font-medium">Facturé</th>
            <th className="text-left p-3 font-medium">Fichiers</th>
            <th className="text-left p-3 font-medium">Dates</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const totalInvoiced = project.invoices.reduce(
              (sum, inv) => sum + inv.total,
              0
            )
            return (
              <tr key={project.id} className="border-t hover:bg-muted/50">
                <td className="p-3 font-medium">{project.name}</td>
                <td className="p-3">
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                    {statusLabels[project.status as keyof typeof statusLabels]}
                  </span>
                </td>
                <td className="p-3">
                  {project.budget ? `${project.budget.toFixed(2)} $` : '-'}
                </td>
                <td className="p-3">{totalInvoiced.toFixed(2)} $</td>
                <td className="p-3">{project.files.length}</td>
                <td className="p-3 text-sm text-muted-foreground">
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : '?'}{' '}
                  -{' '}
                  {project.endDate
                    ? new Date(project.endDate).toLocaleDateString()
                    : '?'}
                </td>
                <td className="p-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCreateInvoice(project)}
                      className="cursor-pointer"
                      title="Créer facture"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUploadDocuments(project)}
                      className="cursor-pointer"
                      title="Téléverser documents"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(project)}
                      className="cursor-pointer"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(project.id)}
                      className="cursor-pointer text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
