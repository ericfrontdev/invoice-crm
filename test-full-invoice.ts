import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Trouver un client
  const client = await prisma.client.findFirst()

  if (!client) {
    console.log('No client found')
    return
  }

  console.log('Using client:', client.name)

  // Créer des unpaid amounts
  const amount1 = await prisma.unpaidAmount.create({
    data: {
      clientId: client.id,
      amount: 100,
      description: 'Test item 1',
      date: new Date(),
      status: 'unpaid'
    }
  })

  const amount2 = await prisma.unpaidAmount.create({
    data: {
      clientId: client.id,
      amount: 200,
      description: 'Test item 2',
      date: new Date(),
      status: 'unpaid'
    }
  })

  console.log('Created unpaid amounts:', amount1.id, amount2.id)

  // Créer une facture avec ces montants
  const response = await fetch('http://localhost:3000/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: client.id,
      unpaidAmountIds: [amount1.id, amount2.id]
    })
  })

  const invoice = await response.json()
  console.log('Invoice created:', invoice)

  // Vérifier que les items ont été créés
  const fullInvoice = await prisma.invoice.findUnique({
    where: { id: invoice.id },
    include: {
      items: true
    }
  })

  console.log('Invoice with items:', JSON.stringify(fullInvoice, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
