'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Paperclip, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type ProjectFile = {
  id: string
  filename: string
  fileSize: number
  fileUrl: string
  uploadedAt: Date
}

export function ProjectFilesList({ files }: { files: ProjectFile[] }) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/projects/files/${deleteId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setDeleteId(null)
        router.refresh()
      } else {
        alert('Erreur lors de la suppression du fichier')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Erreur lors de la suppression du fichier')
    } finally {
      setIsDeleting(false)
    }
  }

  if (files.length === 0) {
    return null
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Fichiers</h2>
        <div className="grid grid-cols-1 gap-3">
          {files.map((file) => (
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
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={file.fileUrl}
                  download={file.filename}
                  className="shrink-0"
                >
                  <Button variant="ghost" size="sm">
                    Télécharger
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(file.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le fichier</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce fichier ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
