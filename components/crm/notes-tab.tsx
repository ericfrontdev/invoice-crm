'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List, Plus } from 'lucide-react'
import { NoteCard } from './note-card'
import { NoteList } from './note-list'
import { NoteModal } from './note-modal'
import { useTranslation } from '@/lib/i18n-context'

type Note = {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

type ClientWithNotes = {
  id: string
  name: string
  notes: Note[]
}

export function NotesTab({
  client,
  externalNoteModalOpen,
  onExternalNoteModalClose,
}: {
  client: ClientWithNotes
  externalNoteModalOpen?: boolean
  onExternalNoteModalClose?: () => void
}) {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const router = useRouter()

  const handleCreateNote = () => {
    setEditingNote(null)
    setIsModalOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingNote(null)
    if (onExternalNoteModalClose) {
      onExternalNoteModalClose()
    }
  }

  const handleSaveNote = async (data: { title: string; content: string; tags: string[] }) => {
    const url = editingNote ? `/api/notes/${editingNote.id}` : `/api/notes`
    const method = editingNote ? 'PATCH' : 'POST'
    const body = editingNote ? data : { ...data, clientId: client.id }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.refresh()
      handleCloseModal()
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm(t('crm.deleteNoteConfirm'))) return

    const res = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="cursor-pointer"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="cursor-pointer"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={handleCreateNote} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          {t('crm.addNote')}
        </Button>
      </div>

      {/* Content */}
      {client.notes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('crm.noNotes')}</p>
          <Button
            onClick={handleCreateNote}
            variant="outline"
            className="mt-4 cursor-pointer"
          >
            {t('crm.addFirstNote')}
          </Button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {client.notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      ) : (
        <NoteList
          notes={client.notes}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
      )}

      {/* Modal */}
      <NoteModal
        isOpen={isModalOpen || externalNoteModalOpen || false}
        onClose={handleCloseModal}
        onSave={handleSaveNote}
        note={editingNote}
      />
    </div>
  )
}
