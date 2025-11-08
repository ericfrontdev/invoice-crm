import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProfilPageClient } from '@/components/pages/profil-page-client'

export default async function ProfilPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      phone: true,
      address: true,
      neq: true,
      tpsNumber: true,
      tvqNumber: true,
      chargesTaxes: true,
      paymentProvider: true,
      paypalEmail: true,
      stripeSecretKey: true,
      logo: true,
      autoRemindersEnabled: true,
      reminderMiseEnDemeureTemplate: true,
      plan: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
    },
  })

  if (!user) {
    redirect('/auth/login')
  }

  return <ProfilPageClient user={user} />
}
