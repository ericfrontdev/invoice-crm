import { prisma } from '@/lib/prisma'

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const superAdmin = await prisma.superAdmin.findUnique({
    where: { userId },
  })
  return !!superAdmin
}
