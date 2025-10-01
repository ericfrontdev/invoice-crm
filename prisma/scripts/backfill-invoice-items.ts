import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const invoices = await prisma.invoice.findMany({
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  let touched = 0
  for (const inv of invoices) {
    if (inv._count.items > 0) continue

    // Prefer authoritative link via UnpaidAmount.invoiceId
    const amounts = await prisma.unpaidAmount.findMany({
      where: { invoiceId: inv.id },
      select: { id: true, description: true, amount: true, date: true, dueDate: true },
      orderBy: { date: 'asc' },
    })

    if (amounts.length === 0) {
      // No linked amounts found; skip to avoid guessing wrong historical lines
      // You can manually backfill these if you know the composition.
      continue
    }

    await prisma.invoiceItem.createMany({
      data: amounts.map((a) => ({
        invoiceId: inv.id,
        description: a.description,
        amount: a.amount,
        date: a.date,
        dueDate: a.dueDate ?? null,
      })),
      skipDuplicates: true,
    })
    touched++
    // Ensure invoice total matches sum of items; if mismatch, do not change stored total here
  }

  console.log(`Backfill complete. Invoices updated: ${touched}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

