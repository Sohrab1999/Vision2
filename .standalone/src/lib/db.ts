import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Phase-0 cleanup: no `log: ['query']` — SQL logging belonged to development
// only and used to flood production logs (and leak query shapes) per request.
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
