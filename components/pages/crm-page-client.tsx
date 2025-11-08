'use client'

import { ClientsGrid } from '@/components/clients-grid'
import { useTranslation } from '@/lib/i18n-context'

type Client = {
  id: string
  name: string
  company: string | null
  email: string | null
}

type CRMPageClientProps = {
  clients: Client[]
}

export function CRMPageClient({ clients }: CRMPageClientProps) {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold">{t('crm.crmClients')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('crm.clickClientToOpenCrm')}
        </p>
      </div>

      {/* Grille de clients */}
      <ClientsGrid clients={clients} />
    </div>
  )
}
