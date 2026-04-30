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
  console.log('Applying schema updates...');
  
  // Update User table
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "salaryCurrency" TEXT DEFAULT 'XOF';`);
    console.log('User table updated.');
  } catch (e) {
    console.error('Error updating User table:', e);
  }

  // Update Notification table
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "companyId" TEXT;`);
    console.log('Notification table updated.');
  } catch (e) {
    console.error('Error updating Notification table:', e);
  }

  console.log('Schema updates done.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
