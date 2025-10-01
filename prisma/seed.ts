import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Créer un utilisateur test
  const user = await prisma.user.upsert({
    where: { email: 'eric@ericouellette.com' },
    update: {},
    create: {
      email: 'eric@ericouellette.com',
      name: 'Eric Ouellette',
    },
  })

  // Créer des clients test
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'Jean Tremblay',
        company: 'Tremblay Construction',
        email: 'jean@tremblay.ca',
        phone: '514-555-0123',
        address: '123 Rue Saint-Denis, Montréal, QC H2X 3K8',
        website: 'https://tremblayconst.ca',
        userId: user.id,
      },
    }),
    prisma.client.create({
      data: {
        name: 'Marie Bouchard',
        company: 'Design Studio MB',
        email: 'marie@designmb.com',
        phone: '418-555-0456',
        address: '456 Grande Allée, Québec, QC G1R 2J3',
        website: 'https://designmb.com',
        userId: user.id,
      },
    }),
    prisma.client.create({
      data: {
        name: 'Pierre Gagnon',
        company: 'Gagnon Tech Solutions',
        email: 'pierre@gagnontech.ca',
        phone: '450-555-0789',
        address: '789 Boul. Taschereau, Longueuil, QC J4K 2V4',
        website: null,
        userId: user.id,
      },
    }),
  ])

  console.log('✅ Seed data created successfully!')
  console.log(`Created user: ${user.name}`)
  console.log(`Created ${clients.length} clients`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
