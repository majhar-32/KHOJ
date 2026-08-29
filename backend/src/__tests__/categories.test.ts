import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';

describe('Categories Endpoints', () => {
  let adminToken: string;
  let categoryWithEventId: string;
  const timestamp = Date.now();

  beforeAll(async () => {
    // 1. Log in as admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@khoj.dev',
        password: 'password123',
      });
    adminToken = adminRes.body.token;

    // 2. Create a test category
    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Cat ${timestamp}`,
      });
    categoryWithEventId = catRes.body.id;

    // 3. Create an organizer & an event attached to this category
    const orgRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Cat Organizer',
        email: `cat-org-${timestamp}@example.com`,
        password: 'Password123!',
        role: 'ORGANIZER',
      });

    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${orgRes.body.token}`)
      .send({
        name: `Event in Test Cat ${timestamp}`,
        category: `Test Cat ${timestamp}`,
        eventDate: '2026-12-01',
        eventTime: '10:00 AM',
        venue: 'Cat Venue',
        city: 'Dhaka',
        mode: 'offline',
        registrationDeadline: '2026-11-20',
        registrationFee: 'Free',
        prizePool: '৳10,000',
        eligibility: 'All',
        teamSize: '1',
        availableSeats: 50,
        certificateInfo: 'Certificate included',
        description: 'Testing category constraint',
        rules: 'Rule 1',
        contactInfo: 'admin@cat.com',
        registrationLink: 'https://example.com/cat',
      });
  });

  afterAll(async () => {
    // Cleanup events, categories, and test user
    await prisma.event.deleteMany({
      where: { name: { contains: `Test Cat ${timestamp}` } },
    });
    await prisma.category.deleteMany({
      where: { name: { contains: `Test Cat ${timestamp}` } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: `cat-org-${timestamp}` } },
    });
    await prisma.$disconnect();
  });

  it('deleting a category that has events attached returns 409 and does not delete it', async () => {
    const res = await request(app)
      .delete(`/api/categories/${categoryWithEventId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');

    // Verify category still exists in DB
    const catInDb = await prisma.category.findUnique({
      where: { id: categoryWithEventId },
    });
    expect(catInDb).not.toBeNull();
  });
});
