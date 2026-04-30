import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Models available:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
