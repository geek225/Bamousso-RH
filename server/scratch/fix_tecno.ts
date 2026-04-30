import prisma from '../src/utils/prisma.js';

async function fixTecnoPlan() {
  console.log("Recherche de l'entreprise Tecno...");
  const tecno = await prisma.company.findFirst({
    where: { name: { contains: 'Tecno', mode: 'insensitive' } }
  });

  if (tecno) {
    console.log(`Entreprise trouvée : ${tecno.name} (ID: ${tecno.id})`);
    await (prisma.company.update({
      where: { id: tecno.id },
      data: { plan: 'LOUBA' } as any
    }) as any);
    console.log("Plan mis à jour : LOUBA");
  } else {
    console.log("Entreprise Tecno non trouvée.");
  }

  process.exit(0);
}

fixTecnoPlan();
