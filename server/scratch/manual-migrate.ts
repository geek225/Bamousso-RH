import { PrismaClient } from '@prisma/client';

// On utilise l'URL de base mais sur le port direct 5432
const directUrl = "postgresql://postgres.ntqbwmvwhtmovdcmwyrr:B29xF80Fxu1cRwY3@aws-1-eu-central-1.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
});

async function main() {
  console.log('Running manual SQL migration...');
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "baseSalary" DOUBLE PRECISION;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bankDetails" TEXT;`);
  console.log('Manual SQL migration done.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
