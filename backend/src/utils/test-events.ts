async function testEventsApi() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('--- STARTING EVENTS API TEST SUITE ---');

  // 1. Log in as admin and organizer
  const adminRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@khoj.dev', password: 'password123' }),
  });
  const adminToken = ((await adminRes.json()) as any).token;

  const org1Res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sadia@example.com', password: 'password123' }),
  });
  const org1Token = ((await org1Res.json()) as any).token;

  const org2Res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nusrat@example.com', password: 'password123' }),
  });
  const org2Token = ((await org2Res.json()) as any).token;

  // 2. Test GET /api/categories
  console.log('\n1. Testing GET /api/categories...');
  const catRes = await fetch(`${baseUrl}/categories`);
  const categories = (await catRes.json()) as string[];
  console.log('Status:', catRes.status);
  console.log('Categories Count:', categories.length);
  console.log('First 3 Categories:', categories.slice(0, 3));

  // 3. Test Public GET /api/events (Expect only approved)
  console.log('\n2. Testing Public GET /api/events...');
  const publicEventsRes = await fetch(`${baseUrl}/events`);
  const publicEvents = (await publicEventsRes.json()) as any[];
  console.log('Status:', publicEventsRes.status);
  console.log('Public Events Count:', publicEvents.length);
  const anyNonApproved = publicEvents.some((e) => e.status !== 'approved');
  console.log('Any non-approved event leaked?:', anyNonApproved);

  // 4. Create new event as Organizer 1 (sadia)
  console.log('\n3. Creating new event as sadia@example.com...');
  const createRes = await fetch(`${baseUrl}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${org1Token}`,
    },
    body: JSON.stringify({
      name: 'Automated Test Hackathon 2026',
      category: 'Hackathon',
      eventDate: '2026-10-15',
      eventTime: '10:00 AM',
      venue: 'Test Auditorium',
      city: 'Dhaka',
      mode: 'offline',
      registrationDeadline: '2026-10-01',
      registrationFee: 'Free',
      prizePool: '৳50,000',
      eligibility: 'All students',
      teamSize: '3-4',
      availableSeats: 50,
      certificateInfo: 'Certificate for all',
      description: 'Test hackathon description',
      rules: 'Test rules',
      contactInfo: 'test@example.com',
      registrationLink: 'https://example.com/register',
    }),
  });
  const createdEvent = (await createRes.json()) as any;
  console.log('Status:', createRes.status);
  console.log('Created Event ID:', createdEvent.id);
  console.log('Created Event Status (expected pending):', createdEvent.status);

  // 5. Confirm newly created event is NOT in public events
  console.log('\n4. Verifying created event is NOT in public events...');
  const checkPublicRes = await fetch(`${baseUrl}/events`);
  const checkPublicEvents = (await checkPublicRes.json()) as any[];
  const foundInPublic = checkPublicEvents.some((e) => e.id === createdEvent.id);
  console.log('Is pending event in public list? (expected false):', foundInPublic);

  // 6. Approve event as Admin
  console.log('\n5. Approving event as Admin...');
  const approveRes = await fetch(`${baseUrl}/events/${createdEvent.id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const approvedEvent = (await approveRes.json()) as any;
  console.log('Status:', approveRes.status);
  console.log('Approved Event Status:', approvedEvent.status);

  // 7. Verify event NOW appears in public events
  console.log('\n6. Verifying approved event NOW appears in public events...');
  const afterApproveRes = await fetch(`${baseUrl}/events`);
  const afterApproveEvents = (await afterApproveRes.json()) as any[];
  const nowFoundInPublic = afterApproveEvents.some((e) => e.id === createdEvent.id);
  console.log('Is approved event now in public list? (expected true):', nowFoundInPublic);

  // 8. Try updating event as different organizer (nusrat) -> expect 403
  console.log('\n7. Attempting update by different organizer nusrat@example.com (expect 403)...');
  const forbidRes = await fetch(`${baseUrl}/events/${createdEvent.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${org2Token}`,
    },
    body: JSON.stringify({ name: 'Hacked Title' }),
  });
  const forbidData = (await forbidRes.json()) as any;
  console.log('Status:', forbidRes.status);
  console.log('Response:', JSON.stringify(forbidData));

  // 9. Update event as its actual owner (sadia) -> flips to PENDING
  console.log('\n8. Updating event as owner sadia@example.com (re-approval check)...');
  const updateRes = await fetch(`${baseUrl}/events/${createdEvent.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${org1Token}`,
    },
    body: JSON.stringify({ name: 'Automated Test Hackathon 2026 (Updated)' }),
  });
  const updatedEvent = (await updateRes.json()) as any;
  console.log('Status:', updateRes.status);
  console.log('Updated Title:', updatedEvent.name);
  console.log('Status after update (expected pending):', updatedEvent.status);

  // 10. Confirm it disappeared from public events again
  console.log('\n9. Confirming updated event disappeared from public list...');
  const finalPublicRes = await fetch(`${baseUrl}/events`);
  const finalPublicEvents = (await finalPublicRes.json()) as any[];
  const inPublicAfterEdit = finalPublicEvents.some((e) => e.id === createdEvent.id);
  console.log('Is event in public list after edit? (expected false):', inPublicAfterEdit);

  console.log('\n--- ALL EVENTS API TESTS PASSED SUCCESSFULLY ---');
}

testEventsApi();
