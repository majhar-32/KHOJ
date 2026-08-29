import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';

describe('Events Endpoints', () => {
  let organizer1Token: string;
  let organizer2Token: string;
  let adminToken: string;
  let createdEventId: string;
  const timestamp = Date.now();

  beforeAll(async () => {
    // 1. Create Organizer 1
    const org1Res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Event Tester 1',
        email: `org1-${timestamp}@example.com`,
        password: 'Password123!',
        role: 'ORGANIZER',
      });
    organizer1Token = org1Res.body.token;

    // 2. Create Organizer 2
    const org2Res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Event Tester 2',
        email: `org2-${timestamp}@example.com`,
        password: 'Password123!',
        role: 'ORGANIZER',
      });
    organizer2Token = org2Res.body.token;

    // 3. Log in as Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@khoj.dev',
        password: 'password123',
      });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    // Clean up created events and test users
    await prisma.event.deleteMany({
      where: { name: { contains: `Test Event ${timestamp}` } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: `org1-${timestamp}` } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: `org2-${timestamp}` } },
    });
    await prisma.$disconnect();
  });

  it('an organizer creating an event results in PENDING status', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizer1Token}`)
      .send({
        name: `Test Event ${timestamp} - PENDING`,
        category: 'Hackathon',
        eventDate: '2026-11-20',
        eventTime: '10:00 AM',
        venue: 'Test Hall',
        city: 'Dhaka',
        mode: 'offline',
        registrationDeadline: '2026-11-10',
        registrationFee: 'Free',
        prizePool: '৳50,000',
        eligibility: 'All students',
        teamSize: '1-4 members',
        availableSeats: 100,
        certificateInfo: 'Participation Certificate',
        description: 'Test event description',
        rules: 'Standard rules apply',
        contactInfo: 'organizer@example.com',
        registrationLink: 'https://example.com/register',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('pending');
    createdEventId = res.body.id;
  });

  it('a public request to GET /api/events never includes PENDING or REJECTED events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const pendingOrRejected = res.body.filter(
      (e: any) => e.status === 'pending' || e.status === 'rejected'
    );
    expect(pendingOrRejected.length).toBe(0);

    const foundCreated = res.body.find((e: any) => e.id === createdEventId);
    expect(foundCreated).toBeUndefined();
  });

  it("an organizer cannot PUT another organizer's event (403 Forbidden)", async () => {
    const res = await request(app)
      .put(`/api/events/${createdEventId}`)
      .set('Authorization', `Bearer ${organizer2Token}`)
      .send({
        name: `Hacked Event ${timestamp}`,
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('editing an APPROVED event resets it to PENDING status', async () => {
    // 1. Admin approves the event
    const approveRes = await request(app)
      .post(`/api/events/${createdEventId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.status).toBe('approved');

    // 2. Organizer 1 edits the event
    const editRes = await request(app)
      .put(`/api/events/${createdEventId}`)
      .set('Authorization', `Bearer ${organizer1Token}`)
      .send({
        name: `Test Event ${timestamp} - EDITED`,
        venue: 'Updated Hall',
      });

    expect(editRes.status).toBe(200);
    expect(editRes.body.status).toBe('pending');

    // 3. Confirm public GET /api/events no longer shows it
    const publicRes = await request(app).get('/api/events');
    const foundInPublic = publicRes.body.find((e: any) => e.id === createdEventId);
    expect(foundInPublic).toBeUndefined();
  });
});
