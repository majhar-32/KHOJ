import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface NewOrganizerDef {
  email: string;
  name: string;
  role: Role;
  institution?: string;
  verified: boolean;
  status: UserStatus;
}

const NEW_ORGANIZERS: NewOrganizerDef[] = [
  {
    email: 'buet_cyber@khoj.dev',
    name: 'BUET Cyber Security Club',
    role: Role.ORGANIZER,
    institution: 'BUET',
    verified: true,
    status: UserStatus.ACTIVE,
  },
  {
    email: 'cuet_sports@khoj.dev',
    name: 'CUET Sports Club',
    role: Role.ORGANIZER,
    institution: 'CUET',
    verified: true,
    status: UserStatus.ACTIVE,
  },
  {
    email: 'cuet_cultural@khoj.dev',
    name: 'CUET Cultural Society',
    role: Role.ORGANIZER,
    institution: 'CUET',
    verified: true,
    status: UserStatus.ACTIVE,
  },
  {
    email: 'ruet_photo@khoj.dev',
    name: 'RUET Photography Club',
    role: Role.ORGANIZER,
    institution: 'RUET',
    verified: true,
    status: UserStatus.ACTIVE,
  },
  {
    email: 'designers@khoj.dev',
    name: 'Dhaka Designers Community',
    role: Role.ORGANIZER,
    institution: 'Dhaka Designers Community',
    verified: true,
    status: UserStatus.ACTIVE,
  },
  {
    email: 'ctg_science@khoj.dev',
    name: 'Chattogram Science Society',
    role: Role.ORGANIZER,
    institution: 'Chattogram Science Society',
    verified: true,
    status: UserStatus.ACTIVE,
  },
  {
    email: 'quickwin@promotions.test',
    name: 'QuickWin Promotions',
    role: Role.ORGANIZER,
    institution: 'QuickWin Promotions',
    verified: false,
    status: UserStatus.ACTIVE,
  },
];

// Mapping: eventId -> target organizer email
const EVENT_MAPPINGS: Record<string, string> = {
  // 1. CUET Innovation Hackathon 2026 -> CUET Computer Club
  'cmtjq371f000kts54g9v00h96': 'sadia@example.com',
  // 2. UX Research Fundamentals Workshop -> Dhaka Designers Community
  'cmtjq37gw000mts54b19jxd0e': 'designers@khoj.dev',
  // 3. Inter-University Debate Fest -> Dhaka University Debating Society
  'cmtjq37oo000ots540q0qrpuv': 'mehedi@example.com',
  // 4. Tech Careers Meetup -> DU Business & Career Club
  'cmtjq37wg000qts54l6tx14az': 'nusrat@example.com',
  // 5. National Robotics Olympiad -> BUET Robotics Society
  'cmtjq3847000sts54kjwxmqic': 'tasnim@example.com',
  // 6. AI for Social Good Competition -> CUET Computer Club
  'cmtjq38bz000uts54ei39zrss': 'sadia@example.com',
  // 7. Business Case Challenge 2026 -> DU Business & Career Club
  'cmtjq38jr000wts546uyfp0o4': 'nusrat@example.com',
  // 8. Campus Photography Contest — 'Everyday Bangladesh' -> RUET Photography Club
  'cmtjq38rl000yts54dqsxgknm': 'ruet_photo@khoj.dev',
  // 9. Intra-University Esports Championship -> CUET Gaming & Esports Society
  'cmtjq38zc0010ts54tcrpocvl': 'khaled@example.com',
  // 10. Inter-Department Cricket Tournament -> CUET Sports Club
  'cmtjq39770012ts54h6klo7o5': 'cuet_sports@khoj.dev',
  // 11. Data Science Bootcamp — Weekend Seminar -> CUET Computer Club
  'cmtjq39ey0014ts54un3m9z1w': 'sadia@example.com',
  // 12. Startup Pitch Night -> DU Business & Career Club
  'cmtjq39mx0016ts5425qdo6kp': 'nusrat@example.com',
  // 13. Product Design Sprint -> Dhaka Designers Community
  'cmtjq3a2e0018ts54xiygh9b6': 'designers@khoj.dev',
  // 14. Physics Olympiad — Regional Round -> Chattogram Science Society
  'cmtjq3aa6001ats54u0foomm3': 'ctg_science@khoj.dev',
  // 15. Cultural Night: Utshob 2026 -> CUET Cultural Society
  'cmtjq3ahy001cts54d4l2y6gq': 'cuet_cultural@khoj.dev',
  // 16. Career Fair: Engineering & Tech 2026 -> DU Business & Career Club
  'cmtjq3app001ets54vt7jc3oc': 'nusrat@example.com',
  // 17. Intro to Cloud Computing Webinar -> CUET Computer Club
  'cmtjq3axm001gts54z6qshd7v': 'sadia@example.com',
  // 18. Junior Coding Olympiad (School Level) -> CUET Computer Club
  'cmtjq3b5e001its54894ra5xr': 'sadia@example.com',
  // 19. Freelancing Bootcamp for Beginners -> DU Business & Career Club
  'cmtjq3bd6001kts5413mxf1qb': 'nusrat@example.com',
  // 20. Mega Prize Giveaway Contest (REJECTED spam demo) -> QuickWin Promotions
  'cmtjq3bkz001mts54be1n8brb': 'quickwin@promotions.test',
  // 21. National Cyber Security & Ethical Hacking Championship 2026 (KEPT) -> BUET Cyber Security Club
  'cmtjr41th0001tse0unwiswvb': 'buet_cyber@khoj.dev',
  // 23. CUET Tech Fiesta 2026 -> CUET Robotics Club
  'cmtqpkbob0002tsggf4rmp0mo': 'robotics_org_test123@khoj.test',
};

const DUPLICATE_EVENT_ID_TO_DELETE = 'cmtjrlqga0003tse03xf5zd45';

async function main() {
  console.log('=== Step 1: Ensure Target Organizer Accounts Exist ===\n');
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  const organizerCache = new Map<string, { id: string; name: string }>();

  for (const org of NEW_ORGANIZERS) {
    const user = await prisma.user.upsert({
      where: { email: org.email },
      update: {
        name: org.name,
        role: org.role,
        institution: org.institution,
        status: org.status,
      },
      create: {
        email: org.email,
        name: org.name,
        passwordHash: defaultPasswordHash,
        role: org.role,
        institution: org.institution,
        verified: org.verified,
        status: org.status,
      },
      select: { id: true, name: true, email: true },
    });
    organizerCache.set(user.email, { id: user.id, name: user.name });
    console.log(`[ACCOUNT READY] ${user.name} (${user.email}) -> ID: ${user.id}`);
  }

  // Pre-fetch any existing organizer accounts referenced in EVENT_MAPPINGS
  for (const email of Object.values(EVENT_MAPPINGS)) {
    if (!organizerCache.has(email)) {
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      });
      if (existing) {
        organizerCache.set(existing.email, { id: existing.id, name: existing.name });
        console.log(`[EXISTING ACCOUNT LOADED] ${existing.name} (${existing.email}) -> ID: ${existing.id}`);
      } else {
        console.error(`[ERROR] Missing target user for email: ${email}`);
      }
    }
  }

  console.log('\n=== Step 2: Handle Duplicate Event Deduplication ===\n');
  const duplicate = await prisma.event.findUnique({
    where: { id: DUPLICATE_EVENT_ID_TO_DELETE },
    select: { id: true, name: true },
  });

  if (duplicate) {
    console.log(`Found duplicate event: "${duplicate.name}" (ID: ${duplicate.id})`);
    const savedCount = await prisma.savedEvent.deleteMany({
      where: { eventId: DUPLICATE_EVENT_ID_TO_DELETE },
    });
    console.log(`Deleted ${savedCount.count} associated SavedEvent record(s).`);

    await prisma.event.delete({
      where: { id: DUPLICATE_EVENT_ID_TO_DELETE },
    });
    console.log(`[DELETED] Duplicate event ${DUPLICATE_EVENT_ID_TO_DELETE} successfully removed.`);
  } else {
    console.log(`Duplicate event ${DUPLICATE_EVENT_ID_TO_DELETE} already absent/deleted.`);
  }

  console.log('\n=== Step 3: Reassign Events to Matching Organizers ===\n');
  let reassignedCount = 0;

  for (const [eventId, targetEmail] of Object.entries(EVENT_MAPPINGS)) {
    const targetUser = organizerCache.get(targetEmail);
    if (!targetUser) {
      console.warn(`[WARN] Target user for ${targetEmail} not found in cache. Skipping event ${eventId}.`);
      continue;
    }

    const currentEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
      },
    });

    if (!currentEvent) {
      console.warn(`[WARN] Event ID ${eventId} not found in database.`);
      continue;
    }

    if (currentEvent.organizerId === targetUser.id) {
      console.log(`[OK / UNCHANGED] "${currentEvent.name}" (ID: ${currentEvent.id}) already assigned to "${targetUser.name}"`);
      continue;
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { organizerId: targetUser.id },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
      },
    });

    console.log(`[REASSIGNED] "${updated.name}"`);
    console.log(`  Previous Organizer: ${currentEvent.organizer?.name} (${currentEvent.organizer?.email})`);
    console.log(`  New Organizer:      ${updated.organizer?.name} (${updated.organizer?.email})\n`);
    reassignedCount++;
  }

  console.log('=== Final Verification Summary ===\n');
  const allEvents = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      organizer: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Total active events in database: ${allEvents.length}`);
  allEvents.forEach((evt, idx) => {
    console.log(`${idx + 1}. [${evt.status}] "${evt.name}"`);
    console.log(`    Organizer: "${evt.organizer.name}" (${evt.organizer.email})`);
  });

  console.log(`\nReassigned ${reassignedCount} event(s). Deduplication complete!`);
}

main()
  .catch((err) => {
    console.error('Reassignment script error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
