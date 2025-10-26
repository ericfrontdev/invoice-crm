import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PricingCard } from '@/components/pricing/pricing-card'

async function getUserSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      betaTester: true,
      lifetimeDiscount: true,
      subscriptionStatus: true,
    },
  })

  return user
}

export default async function PricingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const user = await getUserSubscription(session.user.id)

  // Si déjà abonné, rediriger vers le dashboard
  if (user?.plan === 'pro' && user?.subscriptionStatus === 'active') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <PricingCard
          isBetaTester={user?.betaTester || false}
          lifetimeDiscount={user?.lifetimeDiscount || 0}
        />
      </div>
    </div>
  )
}
