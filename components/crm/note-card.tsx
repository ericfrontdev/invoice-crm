'use client'

import { Button } from '@/components/ui/button'
import { Edit, Trash2, Calendar } from 'lucide-react'

type Note = {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
}) {
  return (
    <div className="bg-card rounded-lg border p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg flex-1">{note.title}</h3>
        <div className="flex gap-1">
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
      </div>

      {/* Content preview */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
        {note.content}
      </p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Date */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>
          Modifié le {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
