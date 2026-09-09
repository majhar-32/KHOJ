import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function inspect() {
  const organizers = await prisma.user.findMany({
    where: { role: 'ORGANIZER' },
    select: { id: true, name: true, email: true, status: true, verified: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`=== ORGANIZER ACCOUNTS COUNT: ${organizers.length} ===`);
  organizers.forEach((o, i) =>
    console.log(`${i + 1}. [${o.id}] "${o.name}" (${o.email}) - Status: ${o.status} | Verified: ${o.verified}`)
  );

  const events = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      category: { select: { name: true } },
      organizerId: true,
      organizer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`\n=== TOTAL EVENTS COUNT: ${events.length} ===`);
  events.forEach((e, i) => {
    console.log(`${i + 1}. [${e.status}] "${e.name}"`);
    console.log(`    Event ID:     ${e.id}`);
    console.log(`    Category:     ${e.category.name}`);
    console.log(`    Organizer ID: ${e.organizerId}`);
    console.log(`    Organizer:    "${e.organizer.name}" (${e.organizer.email})`);
  });
}

inspect()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
