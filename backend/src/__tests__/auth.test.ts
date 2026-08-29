import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';

describe('Auth Endpoints', () => {
  const uniqueEmail = `test-auth-${Date.now()}@example.com`;
  const password = 'Password123!';

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-auth-' } },
    });
    await prisma.$disconnect();
  });

  it('signup creates a user and returns a token and user object', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test Auth User',
        email: uniqueEmail,
        password,
        role: 'ORGANIZER',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(uniqueEmail);
    expect(res.body.user.role).toBe('ORGANIZER');
  });

  it('signup with a duplicate email returns 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Duplicate User',
        email: uniqueEmail,
        password,
        role: 'USER',
      });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('login with correct credentials returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(uniqueEmail);
  });

  it('login with wrong password returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
