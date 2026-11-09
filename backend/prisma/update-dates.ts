import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all events
  const events = await prisma.event.findMany();
  console.log(`Found ${events.length} events to update.`);

  for (const event of events) {
    // Push eventDate 6 months into the future
    const newEventDate = new Date();
    newEventDate.setMonth(newEventDate.getMonth() + 3);

    // Push registrationDeadline 2 months into the future
    const newDeadline = new Date();
    newDeadline.setMonth(newDeadline.getMonth() + 2);

    await prisma.event.update({
      where: { id: event.id },
      data: {
        eventDate: newEventDate,
        registrationDeadline: newDeadline,
      },
    });

    console.log(`✅ Updated: "${event.name}"`);
  }

  console.log('\n🎉 All events updated successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

