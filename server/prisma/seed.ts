/**
 * Script de Seed : Crée le premier SUPER_ADMIN de Bamousso RH.
 * Exécuter avec : npx tsx prisma/seed.ts (depuis le dossier server/)
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = 'llateamd@gmail.com';
  const password = 'password123';
  const firstName = 'Super';
  const lastName = 'Admin';

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`✅ Le SUPER_ADMIN ${email} existe déjà.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`🚀 SUPER_ADMIN créé avec succès : ${user.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
