import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'stephanekevinassamoi@gmail.com';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Creating Super Admin: ${email}...`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      firstName: 'Stephane Kevin',
      lastName: 'Assamoi',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log("Super Admin created/updated successfully:", user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
