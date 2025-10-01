import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const invoice = await prisma.invoice.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      unpaidAmounts: {
        select: { id: true, description: true, amount: true, date: true }
      }
    }
  })

  console.log('Latest invoice:', JSON.stringify(invoice, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
