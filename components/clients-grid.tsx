'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List, Building2, Mail } from 'lucide-react'
import { useTranslation } from '@/lib/i18n-context'

type Client = {
  id: string
  name: string | null
  company: string | null
  email: string | null
}

export function ClientsGrid({ clients }: { clients: Client[] }) {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('clients.noClients')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toggle View Mode */}
      <div className="flex justify-end gap-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          {t('common.grid')}
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4 mr-2" />
          {t('common.list')}
        </Button>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}/details`}
              className="block group"
            >
              <div className="bg-card rounded-lg border p-6 hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                <div className="space-y-3">
                  {/* Client Name */}
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {client.name || t('clients.name')}
                    </h3>
                  </div>

                  {/* Company */}
                  {client.company && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{client.company}</span>
                    </div>
                  )}

                  {/* Email */}
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{client.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium">{t('clients.name')}</th>
                <th className="text-left py-3 px-4 font-medium">{t('clients.company')}</th>
                <th className="text-left py-3 px-4 font-medium">{t('clients.email')}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-t hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={`/clients/${client.id}/details`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {client.name || t('clients.name')}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {client.company || '-'}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {client.email || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
