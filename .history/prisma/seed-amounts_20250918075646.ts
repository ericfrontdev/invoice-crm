import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupère les clients existants
  const clients = await prisma.client.findMany()

  if (clients.length === 0) {
    console.log("Aucun client trouvé. Lance d'abord le seed principal.")
    return
  }

  // Ajouter des montants dus pour chaque client
  for (const client of clients) {
    await prisma.unpaidAmount.createMany({
      data: [
        {
          amount: 500.0,
          description: 'Consultation développement web',
          date: new Date('2024-01-15'),
          dueDate: new Date('2024-02-15'),
          clientId: client.id,
        },
        {
          amount: 1200.0,
          description: 'Création site vitrine',
          date: new Date('2024-02-01'),
          dueDate: new Date('2024-03-01'),
          clientId: client.id,
        },
        {
          amount: 300.0,
          description: 'Maintenance mensuelle',
          date: new Date('2024-02-10'),
          dueDate: new Date('2024-02-25'),
          clientId: client.id,
        },
      ],
    })
  }

  console.log('✅ Montants dus ajoutés avec succès!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
