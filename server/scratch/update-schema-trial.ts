import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Adding trialEndsAt column to Company table...');
  
  try {
    // Exécuter le SQL brut pour ajouter la colonne sans tout péter
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP WITH TIME ZONE;
    `);
    console.log('Column added successfully.');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
