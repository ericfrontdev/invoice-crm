import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Mettre à jour les 3 factures test comme payées
  const result = await prisma.invoice.updateMany({
    where: {
      number: {
        in: ['INV-20251030-1564', 'INV-20251030-3610', 'INV-20251030-6861']
      }
    },
    data: {
      status: 'paid',
      paidAt: new Date(),
      paymentProvider: 'stripe',
    }
  })

  console.log(`✅ ${result.count} factures mises à jour`)

  // Récupérer les IDs des factures
  const invoices = await prisma.invoice.findMany({
    where: {
      number: {
        in: ['INV-20251030-1564', 'INV-20251030-3610', 'INV-20251030-6861']
      }
    },
    select: { id: true, number: true }
  })

  console.log('Factures mises à jour:', invoices)

  // Marquer les unpaidAmounts associés comme payés
  const unpaidResult = await prisma.unpaidAmount.updateMany({
    where: {
      invoiceId: {
        in: invoices.map(inv => inv.id)
      }
    },
    data: {
      status: 'paid'
    }
  })

  console.log(`✅ ${unpaidResult.count} montants impayés mis à jour`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
