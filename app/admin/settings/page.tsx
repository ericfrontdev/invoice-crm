import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/check-super-admin'
import { SettingsForm } from '@/components/admin/settings-form'

export const revalidate = 0

async function getSettings() {
  let settings = await prisma.systemSettings.findFirst()

  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: {
        feedbackSystemEnabled: true,
      }
    })
  }

  return settings
}

export default async function AdminSettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const isAdmin = await isSuperAdmin(session.user.id)

  if (!isAdmin) {
    redirect('/')
  }

  const settings = await getSettings()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Paramètres système</h1>
        <p className="text-muted-foreground">
          Configuration globale de l&apos;application
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  )
}
