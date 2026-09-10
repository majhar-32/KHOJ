import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const allEvents = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      eventDate: true,
      registrationDeadline: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`=== TOTAL EVENTS: ${allEvents.length} ===\n`);

  const now = new Date();
  console.log(`Current system time: ${now.toISOString()}`);
  console.log(`Current system local: ${now.toString()}\n`);

  // Target event search
  const targetEvents = allEvents.filter(e => 
    e.name.toLowerCase().includes('competitive') || 
    e.name.toLowerCase().includes('programming') || 
    e.name.toLowerCase().includes('iupc')
  );

  console.log('=== MATCHING TARGET EVENT(S) ===');
  for (const t of targetEvents) {
    console.log(`ID: ${t.id}`);
    console.log(`Name: "${t.name}"`);
    console.log(`Status: ${t.status}`);
    console.log(`Created: ${t.createdAt.toISOString()}`);
    console.log(`Raw eventDate:             ${t.eventDate.toISOString()}`);
    console.log(`Raw registrationDeadline:  ${t.registrationDeadline.toISOString()}`);
    
    const msDiffDeadline = t.registrationDeadline.getTime() - now.getTime();
    const daysLeftDeadline = Math.ceil(msDiffDeadline / (1000 * 3600 * 24));
    
    const msDiffEvent = t.eventDate.getTime() - now.getTime();
    const daysLeftEvent = Math.ceil(msDiffEvent / (1000 * 3600 * 24));

    console.log(`Calculated days to event:    ${daysLeftEvent} days`);
    console.log(`Calculated days to deadline: ${daysLeftDeadline} days`);
    console.log(`Deadline > Event Date?:      ${t.registrationDeadline.getTime() > t.eventDate.getTime()}`);
    console.log('---');
  }

  console.log('\n=== ALL EVENTS COMPARISON (eventDate vs registrationDeadline) ===');
  let invalidCount = 0;
  allEvents.forEach((e, idx) => {
    const isDeadlineAfterEvent = e.registrationDeadline.getTime() > e.eventDate.getTime();
    const msDiffDeadline = e.registrationDeadline.getTime() - now.getTime();
    const daysLeftDeadline = Math.ceil(msDiffDeadline / (1000 * 3600 * 24));
    const msDiffEvent = e.eventDate.getTime() - now.getTime();
    const daysLeftEvent = Math.ceil(msDiffEvent / (1000 * 3600 * 24));

    if (isDeadlineAfterEvent) invalidCount++;

    const flag = isDeadlineAfterEvent ? '🚨 [DEADLINE AFTER EVENT!]' : '✅ [OK]';
    console.log(`${idx + 1}. ${flag} "${e.name}" (ID: ${e.id})`);
    console.log(`   eventDate:            ${e.eventDate.toISOString()} (${daysLeftEvent}d from now)`);
    console.log(`   registrationDeadline: ${e.registrationDeadline.toISOString()} (${daysLeftDeadline}d from now)`);
  });

  console.log(`\nSummary: ${invalidCount} of ${allEvents.length} events have registrationDeadline AFTER eventDate.`);
}

main().finally(() => prisma.$disconnect());
