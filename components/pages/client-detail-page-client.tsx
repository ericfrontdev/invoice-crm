'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClientDetailView } from '@/components/client-detail-view'
import { useTranslation } from '@/lib/i18n-context'

type UnpaidAmount = {
  id: string
  amount: number
  description: string
  date: Date
  dueDate: Date | null
  status: string
}

type Client = {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  address: string | null
  website: string | null
  unpaidAmounts: UnpaidAmount[]
  user: {
    name: string
    company: string | null
    chargesTaxes: boolean
  }
}

type ClientDetailPageClientProps = {
  client: Client
}

export function ClientDetailPageClient({ client }: ClientDetailPageClientProps) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-visible">
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <div className="mb-6">
          <Link href="/clients">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('clients.backToClients')}
            </Button>
          </Link>
        </div>
      </div>

      <ClientDetailView client={client} />
    </div>
  )
}
