import { PrismaClient } from '@prisma/client';

const directUrl = "postgresql://postgres.ntqbwmvwhtmovdcmwyrr:B29xF80Fxu1cRwY3@aws-1-eu-central-1.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
});

async function main() {
  console.log('Creating ConflictReport table...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ConflictReport" (
      "id" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
      "reporterId" TEXT NOT NULL,
      "companyId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "ConflictReport_pkey" PRIMARY KEY ("id")
    );
  `);
  
  // Add foreign keys
  try {
    await prisma.$executeRawUnsafe(\`ALTER TABLE "ConflictReport" ADD CONSTRAINT "ConflictReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;\`);
    await prisma.$executeRawUnsafe(\`ALTER TABLE "ConflictReport" ADD CONSTRAINT "ConflictReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;\`);
  } catch (e) {
    console.log('Foreign keys might already exist.');
  }

  console.log('Done.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
