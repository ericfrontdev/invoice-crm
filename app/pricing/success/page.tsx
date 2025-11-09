import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { PricingSuccessClient } from '@/components/pages/pricing-success-client'

export default async function PricingSuccessPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  return <PricingSuccessClient />
}
