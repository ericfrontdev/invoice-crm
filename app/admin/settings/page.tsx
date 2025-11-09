import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/check-super-admin'
import { AdminSettingsPage } from '@/components/pages/admin-settings-page'

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

export default async function AdminSettingsServerPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const isAdmin = await isSuperAdmin(session.user.id)

  if (!isAdmin) {
    redirect('/')
  }

  const settings = await getSettings()

  return <AdminSettingsPage settings={settings} />
}
