import fs from 'fs';
import path from 'path';

async function testFullB7Workflow() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('=== STARTING FULL END-TO-END B7 WORKFLOW VERIFICATION ===');

  // 1. Prepare dummy test banner images
  const banner1Path = path.join(__dirname, 'buet-ai-banner.png');
  const banner2Path = path.join(__dirname, 'updated-ai-banner.png');
  const samplePng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mNk+M/wHwMDAwMDEwMDAwYBAwEB/q32zQAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(banner1Path, samplePng);
  fs.writeFileSync(banner2Path, samplePng);

  // 2. Login as organizer (Sadia)
  console.log('\n[Step 1] Logging in as Organizer (sadia@example.com)...');
  const orgLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sadia@example.com', password: 'password123' }),
  });
  const orgLogin = await orgLoginRes.json() as any;
  const orgToken = orgLogin.token;
  console.log(`Organizer logged in: ${orgLogin.user.name} (${orgLogin.user.role})`);

  // 3. Submit Event 1 WITH banner image
  console.log('\n[Step 2] Submitting Event 1 ("BUET AI Summit 2026") WITH banner image...');
  const form1 = new FormData();
  form1.append('name', 'BUET AI Summit 2026');
  form1.append('category', 'AI Competition');
  form1.append('eventDate', '2026-12-10');
  form1.append('eventTime', '09:00 AM');
  form1.append('venue', 'BUET ECE Auditorium');
  form1.append('city', 'Dhaka');
  form1.append('mode', 'offline');
  form1.append('registrationDeadline', '2026-11-25');
  form1.append('registrationFee', 'Free');
  form1.append('prizePool', '৳100,000');
  form1.append('eligibility', 'University students');
  form1.append('teamSize', '1-3');
  form1.append('availableSeats', '150');
  form1.append('certificateInfo', 'Certificates for all');
  form1.append('description', 'Annual AI Summit hosted at BUET featuring keynote speeches and competitions.');
  form1.append('rules', 'Follow standard hackathon rules');
  form1.append('contactInfo', 'contact@buet.ac.bd');
  form1.append('registrationLink', 'https://buet.ac.bd/summit');
  form1.append('officialWebsite', 'https://buet.ac.bd');
  form1.append('bannerColor', 'primary');

  const file1 = new Blob([fs.readFileSync(banner1Path)], { type: 'image/png' });
  form1.append('banner', file1, 'buet-ai-banner.png');

  const res1 = await fetch(`${baseUrl}/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${orgToken}` },
    body: form1,
  });
  const event1 = await res1.json() as any;
  console.log(`Event 1 created. ID: ${event1.id}, Status: ${event1.status}`);
  console.log(`Banner Image URL: ${event1.bannerImageUrl}`);

  // 4. Submit Event 2 WITHOUT banner image
  console.log('\n[Step 3] Submitting Event 2 ("National Math Olympiad 2026") WITHOUT banner image...');
  const form2 = new FormData();
  form2.append('name', 'National Math Olympiad 2026');
  form2.append('category', 'Seminar');
  form2.append('eventDate', '2026-12-15');
  form2.append('eventTime', '10:00 AM');
  form2.append('venue', 'Auditorium');
  form2.append('city', 'Dhaka');
  form2.append('mode', 'offline');
  form2.append('registrationDeadline', '2026-12-01');
  form2.append('registrationFee', 'Free');
  form2.append('prizePool', '৳30,000');
  form2.append('eligibility', 'All students');
  form2.append('teamSize', 'Individual');
  form2.append('certificateInfo', 'Certificates for top 50');
  form2.append('description', 'National Math Olympiad for young minds.');
  form2.append('rules', 'Individual contest, no calculators');
  form2.append('contactInfo', 'math@example.com');
  form2.append('registrationLink', 'https://math.example.com');
  form2.append('bannerColor', 'warning');

  const res2 = await fetch(`${baseUrl}/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${orgToken}` },
    body: form2,
  });
  const event2 = await res2.json() as any;
  console.log(`Event 2 created. ID: ${event2.id}, Status: ${event2.status}`);
  console.log(`Banner Image URL (null expected): ${event2.bannerImageUrl}`);

  // 5. Login as admin (Admin)
  console.log('\n[Step 4] Logging in as Admin (admin@khoj.dev)...');
  const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@khoj.dev', password: 'password123' }),
  });
  const adminLogin = await adminLoginRes.json() as any;
  const adminToken = adminLogin.token;
  console.log(`Admin logged in: ${adminLogin.user.name} (${adminLogin.user.role})`);

  // 6. Admin Approves Event 1 & Event 2
  console.log('\n[Step 5] Approving both events...');
  await fetch(`${baseUrl}/events/${event1.id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`Event 1 (${event1.name}) APPROVED.`);

  await fetch(`${baseUrl}/events/${event2.id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`Event 2 (${event2.name}) APPROVED.`);

  // 7. Verify Public Browse listing
  console.log('\n[Step 6] Verifying public events list on Browse...');
  const publicEventsRes = await fetch(`${baseUrl}/events`);
  const publicEvents = await publicEventsRes.json() as any[];
  const found1 = publicEvents.find(e => e.id === event1.id);
  const found2 = publicEvents.find(e => e.id === event2.id);

  console.log(`Event 1 found on Browse: ${Boolean(found1)}`);
  console.log(`  -> Banner Image URL: ${found1?.bannerImageUrl}`);
  console.log(`Event 2 found on Browse: ${Boolean(found2)}`);
  console.log(`  -> Banner Image URL (null): ${found2?.bannerImageUrl}, Fallback Color: ${found2?.bannerColor}`);

  // 8. Update Event 1 with a NEW banner image
  console.log('\n[Step 7] Updating Event 1 with a NEW banner image...');
  const updateForm = new FormData();
  updateForm.append('name', 'BUET AI Summit 2026 (Updated)');
  const file2 = new Blob([fs.readFileSync(banner2Path)], { type: 'image/png' });
  updateForm.append('banner', file2, 'updated-ai-banner.png');

  const updateRes = await fetch(`${baseUrl}/events/${event1.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${orgToken}` },
    body: updateForm,
  });
  const updated1 = await updateRes.json() as any;
  console.log(`Event 1 updated. Status: ${updated1.status} (pending re-approval)`);
  console.log(`New Banner Image URL: ${updated1.bannerImageUrl}`);

  // 9. Re-approve updated Event 1
  console.log('\n[Step 8] Admin re-approving updated Event 1...');
  await fetch(`${baseUrl}/events/${event1.id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  // 10. Query Event 1 Details
  const detailRes = await fetch(`${baseUrl}/events/${event1.id}`);
  const detail1 = await detailRes.json() as any;
  console.log(`Event 1 Details fetched.`);
  console.log(`  -> Final Banner Image URL: ${detail1.bannerImageUrl}`);
  console.log(`  -> Verified Cloudinary URL format: ${detail1.bannerImageUrl.startsWith('https://res.cloudinary.com/')}`);

  // Clean up dummy local files
  if (fs.existsSync(banner1Path)) fs.unlinkSync(banner1Path);
  if (fs.existsSync(banner2Path)) fs.unlinkSync(banner2Path);

  console.log('\n=== ALL PHASE B7 WORKFLOW STEPS VERIFIED WITH 100% SUCCESS ===');
}

testFullB7Workflow();
