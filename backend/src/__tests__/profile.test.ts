import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';

describe('Profile & Registration Endpoints (Part 2)', () => {
  const userEmail = `profile-test-${Date.now()}@example.com`;
  const initialPassword = 'OldPassword123!';
  const newPassword = 'NewPassword456!';
  let userToken = '';
  let userId = '';
  let eventId = '';

  beforeAll(async () => {
    // Create user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Profile Tester',
        email: userEmail,
        password: initialPassword,
        role: 'USER',
      });
    userToken = signupRes.body.token;
    userId = signupRes.body.user.id;

    // Pick an existing event for registration testing
    const event = await prisma.event.findFirst();
    if (event) {
      eventId = event.id;
    }
  });

  afterAll(async () => {
    if (userId) {
      await prisma.savedEvent.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('PUT /api/auth/me updates user profile fields without modifying email', async () => {
    const res = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Updated Name',
        dateOfBirth: '2001-05-15',
        institution: 'Chittagong University of Engineering and Technology',
        address: 'Raozan, Chattogram',
        email: 'hacker@example.com', // Should NOT change
      });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated Name');
    expect(res.body.user.institution).toBe('Chittagong University of Engineering and Technology');
    expect(res.body.user.address).toBe('Raozan, Chattogram');
    expect(res.body.user.email).toBe(userEmail); // Remains original
    expect(new Date(res.body.user.dateOfBirth).toISOString().slice(0, 10)).toBe('2001-05-15');
  });

  it('PUT /api/auth/change-password rejects wrong current password with 401', async () => {
    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        currentPassword: 'wrongPassword!',
        newPassword: 'SomeNewPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('PUT /api/auth/change-password succeeds with valid password and allows login with new password', async () => {
    const changeRes = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        currentPassword: initialPassword,
        newPassword,
      });

    expect(changeRes.status).toBe(200);
    expect(changeRes.body.message).toBe('Password changed successfully');

    // Verify login with new password works
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: userEmail,
        password: newPassword,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    userToken = loginRes.body.token; // update token
  });

  it('POST /api/events/:id/register auto-saves and marks event as registered', async () => {
    if (!eventId) return;

    // First call: not saved yet -> auto-saves AND marks registered
    const res1 = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res1.status).toBe(200);
    expect(res1.body.saved).toBe(true);
    expect(res1.body.registered).toBe(true);

    // Verify getSavedEvents returns registered: true
    const savedRes = await request(app)
      .get('/api/events/saved')
      .set('Authorization', `Bearer ${userToken}`);

    expect(savedRes.status).toBe(200);
    const savedEvent = savedRes.body.find((e: any) => e.id === eventId);
    expect(savedEvent).toBeDefined();
    expect(savedEvent.saved).toBe(true);
    expect(savedEvent.registered).toBe(true);

    // Second call: toggles registered back to false while keeping saved: true
    const res2 = await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res2.status).toBe(200);
    expect(res2.body.saved).toBe(true);
    expect(res2.body.registered).toBe(false);

    // Re-mark registered: true for stats test
    await request(app)
      .post(`/api/events/${eventId}/register`)
      .set('Authorization', `Bearer ${userToken}`);
  });

  it('GET /api/auth/me/stats returns correct user counts', async () => {
    const res = await request(app)
      .get('/api/auth/me/stats')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('USER');
    expect(res.body.savedEventsCount).toBeGreaterThanOrEqual(1);
    expect(res.body.registeredEventsCount).toBeGreaterThanOrEqual(1);
  });
});
