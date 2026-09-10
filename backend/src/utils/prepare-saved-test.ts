import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAndEnsure() {
  const user = await prisma.user.findUnique({ where: { email: 'rahim@example.com' } });
  if (!user) return console.log('User not found');

  // Find an event whose deadline was > 3 days ago (e.g. Data Science Bootcamp or AI for Social Good)
  const expiredEvent = await prisma.event.findFirst({
    where: {
      name: { contains: 'Data Science Bootcamp' }
    }
  });

  if (expiredEvent) {
    // Ensure rahim has saved it
    await prisma.savedEvent.upsert({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: expiredEvent.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        eventId: expiredEvent.id,
        registered: false
      }
    });
    console.log(`Ensured "${expiredEvent.name}" (ID: ${expiredEvent.id}, deadline: ${expiredEvent.registrationDeadline.toISOString()}) is saved for rahim@example.com.`);
  }

  const saved = await prisma.savedEvent.findMany({
    where: { userId: user.id },
    include: { event: { select: { id: true, name: true, registrationDeadline: true } } }
  });
  console.log(`Total saved for rahim (${saved.length}):`);
  saved.forEach(s => console.log(`- ${s.event.name} (Deadline: ${s.event.registrationDeadline.toISOString()})`));
}

checkAndEnsure().finally(() => prisma.$disconnect());
