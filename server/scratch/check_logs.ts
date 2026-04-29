import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching latest system logs...");
  const logs = await prisma.systemLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (logs.length === 0) {
    console.log("No logs found in SystemLog table.");
  } else {
    console.log(JSON.stringify(logs, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
