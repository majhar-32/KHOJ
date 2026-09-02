import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';

describe('Users Endpoints (Admin Promote / Demote)', () => {
  let adminToken: string;
  let adminUserId: string;
  let regularUserId: string;
  const adminEmail = `admin-test-${Date.now()}@example.com`;
  const regularEmail = `user-test-${Date.now()}@example.com`;
  const password = 'Password123!';

  beforeAll(async () => {
    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test Admin User',
        email: adminEmail,
        password,
        role: 'USER',
      });

    adminUserId = adminRes.body.user.id;

    // Manually elevate to ADMIN in DB
    await prisma.user.update({
      where: { id: adminUserId },
      data: { role: 'ADMIN' },
    });

    // Login as admin to get valid token with ADMIN role payload
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password });

    adminToken = loginRes.body.token;

    // Create regular user
    const userRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Regular Test User',
        email: regularEmail,
        password,
        role: 'USER',
      });

    regularUserId = userRes.body.user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: '-test-' } },
    });
    await prisma.$disconnect();
  });

  it('an Admin can promote a user to ADMIN', async () => {
    const res = await request(app)
      .post(`/api/users/${regularUserId}/promote`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('admin');
  });

  it('an Admin can demote a user back to USER', async () => {
    const res = await request(app)
      .post(`/api/users/${regularUserId}/demote`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('user');
  });

  it('an Admin cannot demote themselves (403 Forbidden)', async () => {
    const res = await request(app)
      .post(`/api/users/${adminUserId}/demote`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Cannot demote your own account');
  });
});
