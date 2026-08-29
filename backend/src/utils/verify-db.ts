import prisma from '../lib/prisma';

async function verify() {
  const usersCount = await prisma.user.count();
  const categoriesCount = await prisma.category.count();
  const eventsCount = await prisma.event.count();
  const savedEventsCount = await prisma.savedEvent.count();

  const approvedCount = await prisma.event.count({ where: { status: 'APPROVED' } });
  const pendingCount = await prisma.event.count({ where: { status: 'PENDING' } });
  const rejectedCount = await prisma.event.count({ where: { status: 'REJECTED' } });

  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true }
  });

  const categories = await prisma.category.findMany({ select: { name: true } });

  console.log('--- DATABASE VERIFICATION REPORT ---');
  console.log('Users Total:', usersCount);
  console.log('Categories Total:', categoriesCount);
  console.log('Events Total:', eventsCount);
  console.log('Saved Events Total:', savedEventsCount);
  console.log('\nEvents by Status:');
  console.log(' - APPROVED:', approvedCount);
  console.log(' - PENDING:', pendingCount);
  console.log(' - REJECTED:', rejectedCount);
  console.log('\nUsers by Role:');
  usersByRole.forEach(r => console.log(` - ${r.role}: ${r._count.id}`));
  console.log('\nCategories:');
  console.log(categories.map(c => c.name).join(', '));
  console.log('------------------------------------');

  await prisma.$disconnect();
}

verify();
