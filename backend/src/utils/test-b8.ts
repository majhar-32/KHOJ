async function testB8AI() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('=== STARTING PHASE B8 GEMINI AI INTEGRATION TESTS ===');

  // 1. Log in as organizer
  console.log('\n[Step 1] Logging in as organizer (sadia@example.com)...');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sadia@example.com', password: 'password123' }),
  });
  const loginData = (await loginRes.json()) as any;
  const token = loginData.token;
  console.log(`Logged in as: ${loginData.user.name} (${loginData.user.email})`);

  // 2. Test AI Event Extraction
  console.log('\n[Step 2] Testing POST /api/ai/extract-event...');
  const sampleRawText = `
🚀 National AI & Robotics Hackathon 2026! 🚀
Are you ready to build the next-gen AI solution for civic problems in Bangladesh?
Join us at the Dhaka University TSC Auditorium on October 25, 2026 starting at 09:00 AM!

🏆 Prize Pool: ৳150,000 Total Cash Prizes + Medals for winners!
👥 Team Size: Teams of 3 to 4 members.
🎓 Eligibility: Open to all undergraduate university students across Bangladesh.
🎟️ Registration Fee: ৳300 per team.
⏳ Registration Deadline: October 10, 2026.
Event Mode: Offline (in-person at Dhaka).
Certificates will be provided for all participants.

For details, visit https://hackathon.du.ac.bd or email us at robotics@du.ac.bd. Register at https://hackathon.du.ac.bd/register
`;

  const extractRes = await fetch(`${baseUrl}/ai/extract-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rawText: sampleRawText }),
  });

  console.log('Extract Status Code:', extractRes.status);
  const extractedData = (await extractRes.json()) as any;
  console.log('\n--- EXTRACTED EVENT JSON RESULT ---');
  console.log(JSON.stringify(extractedData, null, 2));

  // 3. Test AI Natural Language Search
  console.log('\n[Step 3] Testing POST /api/ai/search with natural language queries...');
  
  // Query A
  console.log('\nQuery A: "hackathons in Chattogram"');
  const searchResA = await fetch(`${baseUrl}/ai/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'hackathons in Chattogram' }),
  });
  console.log('Search A Status:', searchResA.status);
  const eventsA = (await searchResA.json()) as any[];
  console.log(`Found ${eventsA.length} matching events:`);
  eventsA.forEach((e) => console.log(`  - [${e.category}] ${e.name} (${e.city}, ${e.mode})`));

  // Query B
  console.log('\nQuery B: "online webinars"');
  const searchResB = await fetch(`${baseUrl}/ai/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'online webinars' }),
  });
  console.log('Search B Status:', searchResB.status);
  const eventsB = (await searchResB.json()) as any[];
  console.log(`Found ${eventsB.length} matching events:`);
  eventsB.forEach((e) => console.log(`  - [${e.category}] ${e.name} (${e.city}, ${e.mode})`));

  // Query C - Nonsense / Vague query
  console.log('\nQuery C: "xyznonexistentquery999"');
  const searchResC = await fetch(`${baseUrl}/ai/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'xyznonexistentquery999' }),
  });
  console.log('Search C Status:', searchResC.status);
  const eventsC = (await searchResC.json()) as any[];
  console.log(`Found ${eventsC.length} matching events (graceful fallback):`);

  console.log('\n=== ALL PHASE B8 BACKEND AI TESTS COMPLETED ===');
}

testB8AI();
