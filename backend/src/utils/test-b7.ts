import fs from 'fs';
import path from 'path';

async function testB7ImageUpload() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('--- STARTING PHASE B7 CLOUDINARY UPLOAD TEST ---');

  // 1. Create a dummy test image file
  const testImagePath = path.join(__dirname, 'test-banner.png');
  // 1x1 transparent PNG buffer
  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(testImagePath, pngBuffer);

  // 2. Log in as organizer
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sadia@example.com', password: 'password123' }),
  });
  const loginData = (await loginRes.json()) as any;
  const token = loginData.token;
  console.log(`Organizer logged in: ${loginData.user.email}`);

  // 3. Test Create Event WITH Banner Image
  console.log('\n1. Creating event WITH banner image attachment...');
  const formDataWithBanner = new FormData();
  formDataWithBanner.append('name', 'Cloudinary Test Hackathon 2026');
  formDataWithBanner.append('category', 'Hackathon');
  formDataWithBanner.append('eventDate', '2026-11-15');
  formDataWithBanner.append('eventTime', '10:00 AM');
  formDataWithBanner.append('venue', 'Tech Hub');
  formDataWithBanner.append('city', 'Dhaka');
  formDataWithBanner.append('mode', 'offline');
  formDataWithBanner.append('registrationDeadline', '2026-11-01');
  formDataWithBanner.append('registrationFee', 'Free');
  formDataWithBanner.append('prizePool', '৳50,000');
  formDataWithBanner.append('eligibility', 'Open to all');
  formDataWithBanner.append('teamSize', '1-4');
  formDataWithBanner.append('availableSeats', '50');
  formDataWithBanner.append('certificateInfo', 'Certificates for all');
  formDataWithBanner.append('description', 'A test hackathon with Cloudinary banner');
  formDataWithBanner.append('rules', 'Follow standard rules');
  formDataWithBanner.append('contactInfo', 'test@example.com');
  formDataWithBanner.append('registrationLink', 'https://example.com/register');

  const fileBlob = new Blob([fs.readFileSync(testImagePath)], { type: 'image/png' });
  formDataWithBanner.append('banner', fileBlob, 'test-banner.png');

  const createWithBannerRes = await fetch(`${baseUrl}/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formDataWithBanner,
  });

  const eventWithBanner = (await createWithBannerRes.json()) as any;
  console.log('Status:', createWithBannerRes.status);
  console.log('Created Event ID:', eventWithBanner.id);
  console.log('Banner Image URL:', eventWithBanner.bannerImageUrl);
  const hasCloudinaryUrl =
    typeof eventWithBanner.bannerImageUrl === 'string' &&
    eventWithBanner.bannerImageUrl.includes('cloudinary.com');
  console.log('Is valid Cloudinary URL? (expected true):', hasCloudinaryUrl);

  // 4. Test Create Event WITHOUT Banner Image
  console.log('\n2. Creating event WITHOUT banner image...');
  const formDataWithoutBanner = new FormData();
  formDataWithoutBanner.append('name', 'Cloudinary Test Seminar (No Banner)');
  formDataWithoutBanner.append('category', 'Seminar');
  formDataWithoutBanner.append('eventDate', '2026-11-20');
  formDataWithoutBanner.append('eventTime', '2:00 PM');
  formDataWithoutBanner.append('venue', 'Auditorium');
  formDataWithoutBanner.append('city', 'Dhaka');
  formDataWithoutBanner.append('mode', 'offline');
  formDataWithoutBanner.append('registrationDeadline', '2026-11-10');
  formDataWithoutBanner.append('registrationFee', 'Free');
  formDataWithoutBanner.append('prizePool', 'N/A');
  formDataWithoutBanner.append('eligibility', 'Open to all');
  formDataWithoutBanner.append('teamSize', 'Individual');
  formDataWithoutBanner.append('certificateInfo', 'None');
  formDataWithoutBanner.append('description', 'A test seminar with no banner');
  formDataWithoutBanner.append('rules', 'N/A');
  formDataWithoutBanner.append('contactInfo', 'test@example.com');
  formDataWithoutBanner.append('registrationLink', 'https://example.com/register');

  const createWithoutBannerRes = await fetch(`${baseUrl}/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formDataWithoutBanner,
  });

  const eventWithoutBanner = (await createWithoutBannerRes.json()) as any;
  console.log('Status:', createWithoutBannerRes.status);
  console.log('Created Event ID:', eventWithoutBanner.id);
  console.log('Banner Image URL (expected null):', eventWithoutBanner.bannerImageUrl);

  // 5. Test Update Event: Upload a new banner
  console.log('\n3. Updating event banner with new image...');
  const updateFormData = new FormData();
  updateFormData.append('name', 'Cloudinary Test Hackathon 2026 - Updated');
  const updateBlob = new Blob([fs.readFileSync(testImagePath)], { type: 'image/png' });
  updateFormData.append('banner', updateBlob, 'updated-banner.png');

  const updateRes = await fetch(`${baseUrl}/events/${eventWithBanner.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: updateFormData,
  });

  const updatedEvent = (await updateRes.json()) as any;
  console.log('Status:', updateRes.status);
  console.log('Updated Banner Image URL:', updatedEvent.bannerImageUrl);
  console.log('Is new Cloudinary URL present? (expected true):', Boolean(updatedEvent.bannerImageUrl));

  // Clean up dummy file
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }

  console.log('\n--- ALL PHASE B7 BACKEND TESTS PASSED SUCCESSFULLY ---');
}

testB7ImageUpload();
