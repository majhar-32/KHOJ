async function testAuth() {
  const baseUrl = 'http://localhost:5000/api/auth';
  console.log('--- STARTING AUTH ENDPOINTS TESTS ---');

  // 1. Test Admin Login
  console.log('\n1. Testing Login as admin@khoj.dev...');
  const adminRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@khoj.dev', password: 'password123' }),
  });
  const adminData = (await adminRes.json()) as any;
  console.log('Status:', adminRes.status);
  console.log('Response:', JSON.stringify(adminData, null, 2));

  const adminToken = adminData.token;

  // 2. Test GET /me with Admin Token
  console.log('\n2. Testing GET /me with admin token...');
  const meRes = await fetch(`${baseUrl}/me`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const meData = await meRes.json();
  console.log('Status:', meRes.status);
  console.log('Response:', JSON.stringify(meData, null, 2));

  // 3. Test Organizer Login
  console.log('\n3. Testing Login as organizer sadia@example.com...');
  const orgRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sadia@example.com', password: 'password123' }),
  });
  const orgData = (await orgRes.json()) as any;
  console.log('Status:', orgRes.status);
  console.log('Organizer User Role:', orgData.user?.role);

  // 4. Test Signup New User
  const randomEmail = `testuser_${Date.now()}@example.com`;
  console.log(`\n4. Testing Signup new user (${randomEmail})...`);
  const signupRes = await fetch(`${baseUrl}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test New User',
      email: randomEmail,
      password: 'password123',
      role: 'USER',
    }),
  });
  const signupData = await signupRes.json();
  console.log('Status:', signupRes.status);
  console.log('Response:', JSON.stringify(signupData, null, 2));

  // 5. Test Signup Duplicate Email (expect 409)
  console.log('\n5. Testing Signup duplicate email (expect 409)...');
  const dupRes = await fetch(`${baseUrl}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate User',
      email: randomEmail,
      password: 'password123',
      role: 'USER',
    }),
  });
  const dupData = await dupRes.json();
  console.log('Status:', dupRes.status);
  console.log('Response:', JSON.stringify(dupData, null, 2));

  // 6. Test Invalid Credentials (expect 401)
  console.log('\n6. Testing Login with wrong password (expect 401)...');
  const wrongRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@khoj.dev', password: 'wrongpassword' }),
  });
  const wrongData = await wrongRes.json();
  console.log('Status:', wrongRes.status);
  console.log('Response:', JSON.stringify(wrongData, null, 2));

  // 7. Test Suspended User Login (expect 403)
  console.log('\n7. Testing Login as suspended user arif@example.com (expect 403)...');
  const suspRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'arif@example.com', password: 'password123' }),
  });
  const suspData = await suspRes.json();
  console.log('Status:', suspRes.status);
  console.log('Response:', JSON.stringify(suspData, null, 2));

  // 8. Test GET /me with Invalid/Missing Token (expect 401)
  console.log('\n8. Testing GET /me with invalid token (expect 401)...');
  const invalidMeRes = await fetch(`${baseUrl}/me`, {
    headers: { Authorization: 'Bearer invalid-token-string' },
  });
  const invalidMeData = await invalidMeRes.json();
  console.log('Status:', invalidMeRes.status);
  console.log('Response:', JSON.stringify(invalidMeData, null, 2));

  console.log('\n--- ALL AUTH TESTS COMPLETED ---');
}

testAuth();
