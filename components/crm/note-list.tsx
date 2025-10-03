'use client'

import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'

type Note = {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export function NoteList({
  notes,
  onEdit,
  onDelete,
}: {
  notes: Note[]
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium">Titre</th>
            <th className="text-left p-3 font-medium">Aperçu</th>
            <th className="text-left p-3 font-medium">Tags</th>
            <th className="text-left p-3 font-medium">Modifié le</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => (
            <tr key={note.id} className="border-t hover:bg-muted/50">
              <td className="p-3 font-medium">{note.title}</td>
              <td className="p-3">
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {note.content}
                </p>
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1">
                  {note.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{note.tags.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="p-3 text-sm text-muted-foreground">
                {new Date(note.updatedAt).toLocaleDateString()}
              </td>
              <td className="p-3">
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(note)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(note.id)}
                    className="cursor-pointer text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
