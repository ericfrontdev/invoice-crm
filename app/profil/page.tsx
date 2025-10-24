import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile-form'
import Link from 'next/link'
import { MessageSquare, ChevronRight } from 'lucide-react'

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
      stripeAccountId: true,
      logo: true,
      autoRemindersEnabled: true,
      reminderMiseEnDemeureTemplate: true,
    },
  })

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-6">
          <Link
            href="/profil/mes-feedbacks"
            className="flex items-center justify-between p-4 bg-card rounded-lg border hover:border-primary transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Mes Feedbacks</h3>
                <p className="text-sm text-muted-foreground">
                  Consultez l&apos;historique de vos suggestions et bugs signalés
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>

        <ProfileForm user={user} />
      </div>
    </div>
  )
}
