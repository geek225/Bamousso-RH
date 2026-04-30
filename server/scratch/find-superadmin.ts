import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const superAdmins = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN' },
    select: { id: true, email: true, firstName: true, lastName: true }
  });
  console.log('Super Admins:', superAdmins);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
