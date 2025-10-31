import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const invoice = await prisma.invoice.findUnique({
    where: { number: 'INV-20251030-9846' },
    select: {
      id: true,
      number: true,
      status: true,
      dueDate: true,
      createdAt: true,
    }
  })

  if (!invoice) {
    console.log('❌ Facture non trouvée')
    return
  }

  console.log('📄 Facture:', invoice)
  console.log('\n📅 Informations:')
  console.log('  - Statut:', invoice.status)
  console.log('  - Date d\'échéance:', invoice.dueDate)
  console.log('  - Créée le:', invoice.createdAt)

  if (invoice.dueDate) {
    const now = new Date()
    const dueDate = new Date(invoice.dueDate)
    const isOverdue = invoice.status === 'sent' && dueDate < now
    const daysLate = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

    console.log('\n⏰ Vérification:')
    console.log('  - Aujourd\'hui:', now.toISOString())
    console.log('  - Date d\'échéance:', dueDate.toISOString())
    console.log('  - Jours de retard:', daysLate)
    console.log('  - Est en retard?', isOverdue ? '✅ OUI' : '❌ NON')
    console.log('  - Raison:', invoice.status !== 'sent' ? `Status = ${invoice.status} (devrait être "sent")` : daysLate <= 0 ? 'Date d\'échéance pas encore passée' : 'Devrait afficher le badge')
  } else {
    console.log('\n⚠️  Aucune date d\'échéance définie')
  }
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
