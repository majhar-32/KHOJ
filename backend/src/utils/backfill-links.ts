import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FREE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSd2Bk4Hke5MF6bDULm9zMUB9RvKS1q8EOVZlqjO5e10EE94tg/viewform?usp=publish-editor';
const PAID_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScaLsgkSbr9EsfDf1NgOZCOiQAr1k_LTf8TPawA64MGJnghPw/viewform?usp=publish-editor';

async function backfillLinks() {
  console.log('--- Starting Backfill of Event Registration Links ---');

  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${events.length} total event(s) in database.\n`);

  const results: Array<{
    id: string;
    name: string;
    fee: string;
    type: 'FREE' | 'PAID';
    oldLink: string;
    newLink: string;
  }> = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const isFree = event.registrationFee.trim().toLowerCase() === 'free';
    const newLink = isFree ? FREE_FORM_URL : PAID_FORM_URL;
    const linkType = isFree ? 'FREE' : 'PAID';

    await prisma.event.update({
      where: { id: event.id },
      data: { registrationLink: newLink },
    });

    results.push({
      id: event.id,
      name: event.name,
      fee: event.registrationFee,
      type: linkType,
      oldLink: event.registrationLink,
      newLink,
    });

    console.log(
      `[${i + 1}/${events.length}] [${linkType}] "${event.name}" | Fee: "${event.registrationFee}"`
    );
    console.log(`  Before: ${event.registrationLink}`);
    console.log(`  After:  ${newLink}\n`);
  }

  console.log('--- Summary ---');
  console.log(`Total events updated: ${results.length}`);
  console.log(`Free events: ${results.filter((r) => r.type === 'FREE').length}`);
  console.log(`Paid events: ${results.filter((r) => r.type === 'PAID').length}`);
  console.log('--- Backfill Complete ---');
}

backfillLinks()
  .catch((err) => {
    console.error('Backfill error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
