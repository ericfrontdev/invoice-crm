import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Générer une chaîne aléatoire alphanumérique
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclu les caractères ambigus: 0, O, I, 1
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Générer un code d'invitation unique
function generateInvitationCode(type: 'ALPHA' | 'BETA'): string {
  const randomPart = generateRandomString(6)
  return `${type}-${randomPart}`
}

async function generateCodes() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.log('Usage: npm run generate-codes <type> <count> [notes]')
    console.log('Example: npm run generate-codes ALPHA 10 "Codes pour les premiers testeurs"')
    process.exit(1)
  }

  const type = args[0].toUpperCase() as 'ALPHA' | 'BETA'
  const count = parseInt(args[1])
  const notes = args[2] || null

  if (type !== 'ALPHA' && type !== 'BETA') {
    console.error('Type must be ALPHA or BETA')
    process.exit(1)
  }

  if (isNaN(count) || count < 1 || count > 100) {
    console.error('Count must be between 1 and 100')
    process.exit(1)
  }

  console.log(`\nGénération de ${count} codes ${type}...\n`)

  const codes = []

  for (let i = 0; i < count; i++) {
    let code = generateInvitationCode(type)

    // Vérifier que le code n'existe pas déjà
    let exists = await prisma.invitationCode.findUnique({
      where: { code }
    })

    // Régénérer si le code existe déjà (très improbable)
    while (exists) {
      code = generateInvitationCode(type)
      exists = await prisma.invitationCode.findUnique({
        where: { code }
      })
    }

    // Créer le code
    const invitationCode = await prisma.invitationCode.create({
      data: {
        code,
        type,
        maxUses: 1,
        uses: 0,
        active: true,
        notes: notes ? `${notes} (${i + 1}/${count})` : null
      }
    })

    codes.push(invitationCode.code)
    console.log(`✓ ${invitationCode.code}`)
  }

  console.log(`\n✅ ${count} codes ${type} générés avec succès!\n`)
  console.log('📋 Liste des codes (pour copier/coller):')
  console.log('─'.repeat(50))
  codes.forEach(code => console.log(code))
  console.log('─'.repeat(50))

  await prisma.$disconnect()
}

generateCodes()
