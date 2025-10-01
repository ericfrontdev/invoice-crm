import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

// Cache le client en dev pour éviter les connexions multiples
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
