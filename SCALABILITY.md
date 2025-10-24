# Guide de Scalabilité SoloPack

## État actuel

**Capacité estimée**: 10-50 utilisateurs actifs confortablement

### Problèmes critiques de scalabilité

#### 1. Absence de pagination
- Les pages de factures/clients chargent **toutes** les données en une seule requête
- Un utilisateur avec 1000 factures va charger les 1000 en mémoire
- Impact: Lenteur extrême et possibilité de crash avec beaucoup de données

#### 2. Cron job des rappels non-scalable
```typescript
// Dans /api/reminders/check/route.ts
const invoices = await prisma.invoice.findMany({
  where: { status: 'sent', dueDate: { not: null } },
  include: { client, reminders }
})
```
- Charge **TOUTES** les factures de **TOUS** les utilisateurs en mémoire
- Avec 10,000 utilisateurs ayant chacun 100 factures = 1 million de factures chargées
- Impact: Timeout garanti, cron job échoue

#### 3. Pas d'indices de base de données
- Aucun `@@index` dans le schéma Prisma
- Les queries sur `userId`, `status`, `dueDate` scannent toute la table
- Impact: Requêtes de plus en plus lentes avec la croissance des données

#### 4. Pas de caching
- `revalidate = 0` partout
- Chaque requête frappe la base de données
- Impact: Charge inutile sur la database

#### 5. Pas de queue system pour les emails
- Les emails sont envoyés de manière synchrone
- Bloque la requête HTTP
- Pas de retry en cas d'échec
- Impact: Timeouts, perte d'emails

#### 6. Pas de rate limiting
- Aucune protection contre les abus d'API
- Vulnérable aux attaques DDoS

---

## Optimisations Court Terme (Essentiel)

**Impact**: 5,000-10,000 utilisateurs actifs confortablement

### 1. ✅ Pagination

**Problème**: Charger 1000 factures = 5-10 secondes, ~50MB de données
**Solution**: Charger 20 factures par page = 50-100ms, ~1MB de données
**Impact**: 100x moins de données transférées

#### Implémentation suggérée

**Backend - API avec cursor-based pagination**:
```typescript
// app/api/invoices/route.ts
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const cursor = searchParams.get('cursor')
  const limit = 20

  const invoices = await prisma.invoice.findMany({
    take: limit + 1, // +1 pour savoir s'il y a une page suivante
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    where: { client: { userId: session.user.id } },
    orderBy: { createdAt: 'desc' },
    include: { client, items, project, _count: { select: { reminders: true } } }
  })

  const hasMore = invoices.length > limit
  const results = hasMore ? invoices.slice(0, -1) : invoices

  return NextResponse.json({
    invoices: results,
    nextCursor: hasMore ? results[results.length - 1].id : null
  })
}
```

**Frontend - Infinite scroll ou pagination classique**:
```typescript
// Option 1: Infinite scroll avec react-query
import { useInfiniteQuery } from '@tanstack/react-query'

function InvoicesList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['invoices'],
    queryFn: ({ pageParam = null }) =>
      fetch(`/api/invoices?cursor=${pageParam}`).then(r => r.json()),
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  return (
    <>
      {data?.pages.map(page =>
        page.invoices.map(invoice => <InvoiceCard key={invoice.id} invoice={invoice} />)
      )}
      {hasNextPage && (
        <Button onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? 'Chargement...' : 'Charger plus'}
        </Button>
      )}
    </>
  )
}
```

**Fichiers à modifier**:
- `app/api/invoices/route.ts`
- `app/api/clients/route.ts`
- `app/invoices/page.tsx`
- `app/clients/page.tsx`
- `components/invoices-page-client.tsx`
- `components/clients-list.tsx`

---

### 2. ✅ Indices de base de données

**Problème**: Query `WHERE userId = X` scanne toute la table (2-5 secondes sur 500k factures)
**Solution**: Index seek direct (10-50ms)
**Impact**: 50-100x plus rapide

#### Implémentation

**Modifier `prisma/schema.prisma`**:
```prisma
model User {
  id                              String    @id @default(cuid())
  email                           String    @unique
  // ... autres champs

  @@index([email])
}

model Client {
  id      String  @id @default(cuid())
  userId  String
  email   String?
  // ... autres champs

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([email])
}

model Project {
  id        String   @id @default(cuid())
  clientId  String
  status    String   @default("active")
  // ... autres champs

  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])
  @@index([status])
}

model Invoice {
  id         String    @id @default(cuid())
  clientId   String
  projectId  String?
  status     String    @default("draft")
  dueDate    DateTime?
  createdAt  DateTime  @default(now())
  // ... autres champs

  client     Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])
  @@index([projectId])
  @@index([status])
  @@index([dueDate])
  @@index([createdAt])
  @@index([status, dueDate]) // Index composite pour le cron job
}

model InvoiceReminder {
  id         String   @id @default(cuid())
  invoiceId  String
  type       String
  sentAt     DateTime @default(now())
  status     String   @default("sent")
  // ... autres champs

  invoice    Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@index([type])
  @@index([sentAt])
}

model TimeEntry {
  id         String   @id @default(cuid())
  projectId  String
  date       DateTime
  // ... autres champs

  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([date])
}
```

**Commandes à exécuter**:
```bash
npx prisma migrate dev --name add_database_indices
npx prisma generate
```

---

### 3. ✅ Optimiser le cron job par batch

**Problème**: Charge toutes les factures en mémoire → timeout avec 100k+ factures
**Solution**: Traiter par batch de 100 factures
**Impact**: Peut traiter 100,000+ factures sans timeout

#### Implémentation

**Modifier `app/api/reminders/check/route.ts`**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminderEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    // Vérification de sécurité
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let processedCount = 0
    let sentCount = 0
    let errorCount = 0
    const BATCH_SIZE = 100
    let skip = 0

    // Compter le total pour le log
    const totalCount = await prisma.invoice.count({
      where: {
        status: 'sent',
        dueDate: { not: null }
      }
    })

    console.log(`🔄 Début du traitement: ${totalCount} factures à vérifier`)

    // Traiter par batch
    while (skip < totalCount) {
      const invoices = await prisma.invoice.findMany({
        where: {
          status: 'sent',
          dueDate: { not: null }
        },
        take: BATCH_SIZE,
        skip: skip,
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  company: true,
                  logo: true,
                  autoRemindersEnabled: true,
                  reminderMiseEnDemeureTemplate: true
                }
              }
            }
          },
          reminders: true
        }
      })

      // Traiter chaque facture du batch
      for (const invoice of invoices) {
        processedCount++

        // Vérifier si l'utilisateur a activé les rappels auto
        if (!invoice.client.user.autoRemindersEnabled) {
          continue
        }

        const dueDate = new Date(invoice.dueDate!)
        dueDate.setHours(0, 0, 0, 0)

        // Calculer les dates des rappels
        const reminder1Date = new Date(dueDate)
        reminder1Date.setDate(dueDate.getDate() - 3)

        const reminder2Date = new Date(dueDate)
        reminder2Date.setDate(dueDate.getDate() + 1)

        const reminder3Date = new Date(dueDate)
        reminder3Date.setDate(dueDate.getDate() + 7)

        const miseEnDemeureDate = new Date(dueDate)
        miseEnDemeureDate.setDate(dueDate.getDate() + 14)

        // Map des rappels déjà envoyés
        const sentReminders = new Set(invoice.reminders.map(r => r.type))

        // Vérifier quel rappel envoyer aujourd'hui
        let reminderType: string | null = null

        if (today.getTime() === reminder1Date.getTime() && !sentReminders.has('reminder1')) {
          reminderType = 'reminder1'
        } else if (today.getTime() === reminder2Date.getTime() && !sentReminders.has('reminder2')) {
          reminderType = 'reminder2'
        } else if (today.getTime() === reminder3Date.getTime() && !sentReminders.has('reminder3')) {
          reminderType = 'reminder3'
        } else if (today.getTime() === miseEnDemeureDate.getTime() && !sentReminders.has('mise_en_demeure')) {
          reminderType = 'mise_en_demeure'
        }

        if (!reminderType) {
          continue
        }

        // Envoyer l'email
        try {
          await sendReminderEmail({
            to: invoice.client.email!,
            reminderType,
            invoice,
            user: invoice.client.user
          })

          // Logger le rappel
          await prisma.invoiceReminder.create({
            data: {
              invoiceId: invoice.id,
              type: reminderType,
              sentTo: invoice.client.email!,
              status: 'sent'
            }
          })

          sentCount++
          console.log(`✅ Rappel ${reminderType} envoyé pour facture ${invoice.number}`)
        } catch (error) {
          errorCount++
          console.error(`❌ Erreur envoi rappel ${reminderType} pour facture ${invoice.number}:`, error)

          // Logger l'erreur
          await prisma.invoiceReminder.create({
            data: {
              invoiceId: invoice.id,
              type: reminderType,
              sentTo: invoice.client.email!,
              status: 'error',
              errorMessage: error instanceof Error ? error.message : 'Erreur inconnue'
            }
          })
        }
      }

      skip += BATCH_SIZE

      // Log de progression
      console.log(`📊 Progression: ${skip}/${totalCount} factures traitées`)
    }

    console.log(`✅ Traitement terminé: ${processedCount} factures traitées, ${sentCount} rappels envoyés, ${errorCount} erreurs`)

    return NextResponse.json({
      success: true,
      processed: processedCount,
      sent: sentCount,
      errors: errorCount
    })
  } catch (error) {
    console.error('❌ Erreur cron job rappels:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement des rappels' },
      { status: 500 }
    )
  }
}
```

**Fichiers à modifier**:
- `app/api/reminders/check/route.ts`

---

### 4. ✅ Queue system (BullMQ + Redis)

**Problème**: Emails envoyés de manière synchrone, bloque la requête
**Solution**: Queue asynchrone avec retry automatique
**Impact**: Peut gérer 10,000+ emails/heure, pas de perte d'email

#### Installation

```bash
npm install bullmq ioredis
```

#### Configuration Redis

**Option 1: Upstash Redis (recommandé pour Vercel)**
- Gratuit jusqu'à 10,000 commandes/jour
- Serverless, pas de serveur à gérer
- URL: https://upstash.com/

**Option 2: Redis local pour développement**
```bash
# macOS avec Homebrew
brew install redis
brew services start redis

# Ou avec Docker
docker run -d -p 6379:6379 redis:alpine
```

**Variables d'environnement** (`.env`):
```env
REDIS_URL=redis://localhost:6379
# OU pour Upstash:
# REDIS_URL=rediss://default:xxxx@xxxx.upstash.io:6379
```

#### Implémentation

**Créer `lib/email-queue.ts`**:
```typescript
import { Queue, Worker } from 'bullmq'
import { Redis } from 'ioredis'
import { sendReminderEmail } from '@/lib/email'

// Connexion Redis
const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null
})

// Queue pour les emails
export const emailQueue = new Queue('email-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry 3 fois en cas d'échec
    backoff: {
      type: 'exponential',
      delay: 5000 // Première retry après 5s, puis 10s, puis 20s
    },
    removeOnComplete: {
      age: 24 * 3600, // Garder les jobs complétés pendant 24h
      count: 1000
    },
    removeOnFail: {
      age: 7 * 24 * 3600 // Garder les échecs pendant 7 jours
    }
  }
})

// Type des jobs
interface EmailJob {
  type: 'reminder'
  to: string
  reminderType: string
  invoiceId: string
  userId: string
}

// Ajouter un email à la queue
export async function queueReminderEmail(data: EmailJob) {
  await emailQueue.add('send-reminder', data, {
    jobId: `${data.invoiceId}-${data.reminderType}`, // Évite les doublons
  })
}

// Worker pour traiter les emails (à lancer dans un process séparé ou serverless function)
export function startEmailWorker() {
  const worker = new Worker(
    'email-queue',
    async (job) => {
      console.log(`📧 Traitement email job ${job.id}`)

      const { type, to, reminderType, invoiceId, userId } = job.data as EmailJob

      if (type === 'reminder') {
        // Récupérer les données nécessaires
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: {
            client: {
              include: {
                user: {
                  select: {
                    email: true,
                    company: true,
                    logo: true,
                    reminderMiseEnDemeureTemplate: true
                  }
                }
              }
            }
          }
        })

        if (!invoice) {
          throw new Error(`Invoice ${invoiceId} not found`)
        }

        // Envoyer l'email
        await sendReminderEmail({
          to,
          reminderType,
          invoice,
          user: invoice.client.user
        })

        // Logger le succès
        await prisma.invoiceReminder.create({
          data: {
            invoiceId,
            type: reminderType,
            sentTo: to,
            status: 'sent'
          }
        })

        console.log(`✅ Email ${reminderType} envoyé pour facture ${invoice.number}`)
      }
    },
    {
      connection,
      concurrency: 5 // Traiter 5 emails en parallèle
    }
  )

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} complété`)
  })

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} échoué:`, err)
  })

  return worker
}
```

**Créer un API route pour le worker** (`app/api/worker/email/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { startEmailWorker } from '@/lib/email-queue'

let worker: any = null

export async function POST(req: NextRequest) {
  // Sécurité: seulement accessible en local ou via token
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.WORKER_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!worker) {
    worker = startEmailWorker()
    return NextResponse.json({ message: 'Worker démarré' })
  }

  return NextResponse.json({ message: 'Worker déjà actif' })
}
```

**Modifier le cron job** pour utiliser la queue:
```typescript
// Dans app/api/reminders/check/route.ts
import { queueReminderEmail } from '@/lib/email-queue'

// Au lieu de:
// await sendReminderEmail(...)

// Faire:
await queueReminderEmail({
  type: 'reminder',
  to: invoice.client.email!,
  reminderType,
  invoiceId: invoice.id,
  userId: invoice.client.user.id
})
```

**Démarrage du worker**:
- En développement: `node -r ts-node/register lib/email-worker-standalone.ts`
- En production sur Vercel: Utiliser Vercel Background Functions ou service externe (Railway, Render)

**Fichiers à créer/modifier**:
- `lib/email-queue.ts` (nouveau)
- `app/api/worker/email/route.ts` (nouveau)
- `app/api/reminders/check/route.ts` (modifier pour utiliser la queue)
- `package.json` (ajouter les dépendances)

---

## Optimisations Moyen Terme

**Impact**: 20,000-50,000 utilisateurs actifs

### 5. Caching (Redis)

**Bénéfices**:
- Réduire la charge sur la database de 70-90%
- Temps de réponse API divisé par 10

**Stratégie**:
```typescript
// Cacher les données utilisateur (rarement modifiées)
const userKey = `user:${userId}`
let user = await redis.get(userKey)
if (!user) {
  user = await prisma.user.findUnique({ where: { id: userId } })
  await redis.set(userKey, JSON.stringify(user), 'EX', 3600) // 1h cache
}

// Cacher les statistiques (régénérées toutes les heures)
const statsKey = `stats:${userId}`
let stats = await redis.get(statsKey)
if (!stats) {
  stats = await calculateUserStats(userId)
  await redis.set(statsKey, JSON.stringify(stats), 'EX', 3600)
}

// Invalider le cache lors des modifications
await prisma.invoice.create({ data })
await redis.del(`stats:${userId}`) // Forcer recalcul
```

---

### 6. Rate limiting

**Protection contre**:
- Abus d'API
- Attaques DDoS
- Bots malveillants

**Implémentation avec Upstash Ratelimit**:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requêtes par minute
  analytics: true
})

// Dans chaque API route
export async function GET(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes, réessayez plus tard' },
      { status: 429 }
    )
  }

  // ... suite du traitement
}
```

---

### 7. Optimistic updates

**Améliore l'UX**: L'interface réagit instantanément avant la réponse du serveur

**Exemple avec React Query**:
```typescript
const mutation = useMutation({
  mutationFn: (newInvoice) => fetch('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(newInvoice)
  }),
  onMutate: async (newInvoice) => {
    // Annuler les queries en cours
    await queryClient.cancelQueries({ queryKey: ['invoices'] })

    // Sauvegarder l'état précédent
    const previousInvoices = queryClient.getQueryData(['invoices'])

    // Mettre à jour optimistiquement
    queryClient.setQueryData(['invoices'], (old) => [...old, newInvoice])

    return { previousInvoices }
  },
  onError: (err, newInvoice, context) => {
    // Rollback en cas d'erreur
    queryClient.setQueryData(['invoices'], context.previousInvoices)
  }
})
```

---

### 8. Lazy loading / Virtualisation

**Pour les longues listes** (1000+ items), utiliser la virtualisation:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function InvoicesList({ invoices }) {
  const parentRef = useRef()

  const rowVirtualizer = useVirtualizer({
    count: invoices.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Hauteur estimée d'une ligne
    overscan: 5 // Nombre de lignes à pré-rendre
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <InvoiceCard invoice={invoices[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Optimisations Long Terme

**Impact**: 100,000+ utilisateurs actifs

### 9. CDN pour les assets statiques
- Cloudflare, AWS CloudFront
- Images optimisées avec Next.js Image

### 10. Monitoring et alertes
- **Sentry**: Erreurs JavaScript et backend
- **Vercel Analytics**: Performance web
- **DataDog/New Relic**: Métriques infrastructure
- **Alertes**: Slack/Email quand CPU > 80%, erreurs > 1%/min

### 11. Database read replicas
- Séparer les lectures (read replicas) des écritures (primary)
- Prisma supporte les read replicas
- Exemple: 1 primary + 2-3 read replicas = 3-4x capacité lecture

---

## Estimation de capacité finale

| Optimisations | Utilisateurs actifs | Coût mensuel estimé |
|--------------|---------------------|---------------------|
| **Aucune (actuel)** | 10-50 | $20-50 (Vercel Hobby + DB) |
| **Court terme** | 5,000-10,000 | $50-200 (Vercel Pro + DB + Redis) |
| **+ Moyen terme** | 20,000-50,000 | $200-500 (DB plus grosse + Redis Pro) |
| **+ Long terme** | 100,000+ | $500-2000 (Infra complète + monitoring) |

---

## Checklist d'implémentation

### Phase 1: Court terme (1-2 semaines)
- [ ] Ajouter tous les indices database
- [ ] Implémenter pagination sur factures
- [ ] Implémenter pagination sur clients
- [ ] Implémenter pagination sur projets
- [ ] Optimiser cron job par batch
- [ ] Configurer Redis (Upstash)
- [ ] Implémenter queue system pour emails
- [ ] Tester avec dataset de 10,000+ factures

### Phase 2: Moyen terme (2-4 semaines)
- [ ] Implémenter caching Redis
- [ ] Ajouter rate limiting
- [ ] Optimistic updates sur actions fréquentes
- [ ] Virtualisation des longues listes
- [ ] Tests de charge (k6, Artillery)

### Phase 3: Long terme (ongoing)
- [ ] Setup CDN
- [ ] Monitoring complet (Sentry, DataDog)
- [ ] Database read replicas si nécessaire
- [ ] Optimisations continues basées sur métriques réelles

---

## Tests de charge recommandés

### Outil: k6

**Installation**:
```bash
brew install k6  # macOS
```

**Script de test** (`load-test.js`):
```javascript
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Montée à 50 utilisateurs
    { duration: '3m', target: 50 },   // Maintien à 50
    { duration: '1m', target: 100 },  // Montée à 100
    { duration: '3m', target: 100 },  // Maintien à 100
    { duration: '1m', target: 0 },    // Descente
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes < 500ms
    http_req_failed: ['rate<0.01'],   // < 1% d'erreurs
  },
}

export default function () {
  const response = http.get('https://your-app.vercel.app/api/invoices')

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })

  sleep(1)
}
```

**Exécution**:
```bash
k6 run load-test.js
```

---

## Ressources utiles

- **Prisma Performance**: https://www.prisma.io/docs/guides/performance-and-optimization
- **Next.js Performance**: https://nextjs.org/docs/app/building-your-application/optimizing
- **BullMQ Documentation**: https://docs.bullmq.io/
- **Upstash Redis**: https://upstash.com/docs/redis
- **React Query**: https://tanstack.com/query/latest
- **k6 Load Testing**: https://k6.io/docs/

---

## Contact et support

Pour toute question sur ces optimisations, référez-vous à la documentation ou ouvrez une issue sur GitHub.
