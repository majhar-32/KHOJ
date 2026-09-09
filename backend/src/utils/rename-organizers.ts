import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OrganizerRenameMapping {
  email: string;
  newName: string;
}

const RENAMES: OrganizerRenameMapping[] = [
  {
    email: 'sadia@example.com',
    newName: 'CUET Computer Club',
  },
  {
    email: 'nusrat@example.com',
    newName: 'DU Business & Career Club',
  },
  {
    email: 'mehedi@example.com',
    newName: 'Dhaka University Debating Society',
  },
  {
    email: 'khaled@example.com',
    newName: 'CUET Gaming & Esports Society',
  },
  {
    email: 'tasnim@example.com',
    newName: 'BUET Robotics Society',
  },
  {
    email: 'robotics_org_test123@khoj.test',
    newName: 'CUET Robotics Club',
  },
];

async function renameOrganizers() {
  console.log('=== Renaming Organizer Accounts to Organization Names ===\n');

  let updatedCount = 0;

  for (const item of RENAMES) {
    const existing = await prisma.user.findUnique({
      where: { email: item.email },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!existing) {
      console.warn(`[WARN] User not found for email: ${item.email}`);
      continue;
    }

    if (existing.name === item.newName) {
      console.log(`[SKIP] ${existing.email} already has name: "${existing.name}"`);
      continue;
    }

    const updated = await prisma.user.update({
      where: { email: item.email },
      data: { name: item.newName },
      select: { id: true, name: true, email: true },
    });

    console.log(`[UPDATED] ${updated.email}`);
    console.log(`  Old: "${existing.name}"`);
    console.log(`  New: "${updated.name}"\n`);
    updatedCount++;
  }

  console.log('=== Summary ===');
  console.log(`Successfully updated ${updatedCount} organizer record(s).\n`);
}

renameOrganizers()
  .catch((err) => {
    console.error('Renaming script error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
