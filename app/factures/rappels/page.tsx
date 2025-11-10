import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { RemindersHistoryPageClient } from '@/components/pages/reminders-history-page-client'

export const revalidate = 0

async function getReminders(userId: string) {
  const reminders = await prisma.invoiceReminder.findMany({
    where: {
      invoice: {
        client: {
          userId,
        },
      },
    },
    include: {
      invoice: {
        select: {
          id: true,
          number: true,
          total: true,
          client: {
            select: {
              name: true,
              company: true,
            },
          },
        },
      },
    },
    orderBy: {
      sentAt: 'desc',
    },
  })

  return reminders
}

export default async function RemindersHistoryPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const reminders = await getReminders(session.user.id)

  return <RemindersHistoryPageClient reminders={reminders} />
}
