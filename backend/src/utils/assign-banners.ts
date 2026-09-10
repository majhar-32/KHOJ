import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import cloudinary from '../lib/cloudinary';

const prisma = new PrismaClient();

// Map category names to high-quality specific Pexels search queries
const CATEGORY_SEARCH_MAP: Record<string, string> = {
  'Hackathon': 'hackathon coding programming event',
  'Workshop': 'workshop tech learning collaboration hands on',
  'Webinar': 'online webinar presentation video conference',
  'Competitive Programming': 'coding contest software programming developer',
  'Programming Contest': 'competitive programming computer coding competition',
  'Cultural Event': 'cultural festival stage dance music performance',
  'Sports Tournament': 'sports tournament stadium match athletic',
  'Tech Fest': 'technology festival exhibition robotics innovation',
  'Case Competition': 'business case presentation corporate competition meeting',
  'Business Case Competition': 'business case presentation corporate competition meeting',
  'Olympiad': 'science math competition exam classroom',
  'Debate': 'debate competition podium speech microphone public speaking',
  'Debate Competition': 'debate competition podium speech microphone public speaking',
  'Esports': 'esports gaming competition tournament players screens',
  'Gaming Tournament': 'esports gaming tournament competition gamers screens',
  'Conference': 'academic conference stage keynote speaker auditorium',
  'Bootcamp': 'software engineering coding bootcamp team working',
  'Seminar': 'data science technology seminar lecture conference',
  'Design': 'graphic design ux ui creative design workshop',
  'Design Contest': 'creative product design ui ux workshop prototyping',
  'Photography': 'photography exhibition camera shooting gallery',
  'Photography Contest': 'photography camera shooting photographer portrait landscape',
  'Startup Competition': 'startup pitch presentation investor conference pitch deck',
  'Career Fair': 'career fair job expo hiring booth students professionals',
  'Job Fair': 'job fair career expo hiring interview booths',
  'AI Competition': 'artificial intelligence robotics machine learning technology',
  'Robotics Competition': 'robotics competition technology robots team building',
};

function getSearchQuery(categoryName: string, eventName: string): string {
  // 1. Check exact category match
  if (CATEGORY_SEARCH_MAP[categoryName]) {
    return CATEGORY_SEARCH_MAP[categoryName];
  }

  // 2. Check event name specific matches
  const lowerName = eventName.toLowerCase();
  if (lowerName.includes('pitch') || lowerName.includes('startup')) {
    return 'startup pitch presentation investor conference pitch deck';
  }
  if (lowerName.includes('career') || lowerName.includes('job fair')) {
    return 'career fair job expo hiring booth students professionals';
  }
  if (lowerName.includes('robot') || lowerName.includes('robotics')) {
    return 'robotics competition technology robot';
  }
  if (lowerName.includes('cloud') || lowerName.includes('devops')) {
    return 'cloud computing server technology networking';
  }
  if (lowerName.includes('data science') || lowerName.includes('machine learning')) {
    return 'data science technology lecture seminar';
  }
  if (lowerName.includes('game') || lowerName.includes('gaming') || lowerName.includes('esports')) {
    return 'esports gaming tournament competition gamers screens';
  }
  if (lowerName.includes('debate')) {
    return 'debate competition podium speech microphone public speaking';
  }
  if (lowerName.includes('cyber') || lowerName.includes('security') || lowerName.includes('hack')) {
    return 'cyber security hacker code programming screen';
  }
  if (lowerName.includes('junior coding') || lowerName.includes('school')) {
    return 'students coding learning computers classroom';
  }
  if (lowerName.includes('photography') || lowerName.includes('photo')) {
    return 'photography camera shooting photographer portrait landscape';
  }

  // 3. Fallback to longest partial category matches
  for (const [key, query] of Object.entries(CATEGORY_SEARCH_MAP)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase())) {
      return query;
    }
  }

  // Sensible default
  return `${categoryName} event stage conference`;
}

async function fetchPexelsPhoto(query: string, apiKey: string): Promise<string | null> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=5`;
  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pexels API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as any;
  if (data && data.photos && data.photos.length > 0) {
    // Prefer large2x or landscape orientation image for wide banners
    const photo = data.photos[0];
    return photo.src?.large2x || photo.src?.landscape || photo.src?.large || photo.src?.original || null;
  }

  return null;
}

async function uploadToCloudinary(remoteImageUrl: string): Promise<string> {
  const uploadResult = await cloudinary.uploader.upload(remoteImageUrl, {
    folder: 'khoj-event-banners',
    resource_type: 'image',
  });
  return uploadResult.secure_url;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function assignBanners() {
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    console.error('ERROR: PEXELS_API_KEY is not defined in environment variables.');
    process.exit(1);
  }

  console.log('=== Pexels API Key detected. Fetching events without bannerImageUrl... ===\n');

  const targetName = process.argv.slice(2).join(' ').trim();
  const whereClause: any = targetName
    ? { name: { contains: targetName, mode: 'insensitive' } }
    : {
        OR: [
          { bannerImageUrl: null },
          { bannerImageUrl: '' },
        ],
      };

  const eventsWithoutBanner = await prisma.event.findMany({
    where: whereClause,
    include: {
      category: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${eventsWithoutBanner.length} event(s) missing bannerImageUrl.\n`);

  if (eventsWithoutBanner.length === 0) {
    console.log('No events need banner assignment. Done.');
    return;
  }

  const results: Array<{
    id: string;
    name: string;
    category: string;
    query: string;
    pexelsUrl: string | null;
    cloudinaryUrl: string | null;
    status: 'SUCCESS' | 'FAILED' | 'NO_PHOTO_FOUND';
    error?: string;
  }> = [];

  for (let i = 0; i < eventsWithoutBanner.length; i++) {
    const event = eventsWithoutBanner[i];
    const categoryName = event.category?.name || 'General';
    const searchQuery = getSearchQuery(categoryName, event.name);

    console.log(`[${i + 1}/${eventsWithoutBanner.length}] Processing "${event.name}"...`);
    console.log(`  Category:     ${categoryName}`);
    console.log(`  Search Query: "${searchQuery}"`);

    try {
      // 1. Fetch photo from Pexels
      const pexelsPhotoUrl = await fetchPexelsPhoto(searchQuery, pexelsApiKey);
      if (!pexelsPhotoUrl) {
        console.warn(`  ⚠️  No photo found on Pexels for query: "${searchQuery}"`);
        results.push({
          id: event.id,
          name: event.name,
          category: categoryName,
          query: searchQuery,
          pexelsUrl: null,
          cloudinaryUrl: null,
          status: 'NO_PHOTO_FOUND',
        });
        await sleep(400);
        continue;
      }

      console.log(`  Found Pexels Photo: ${pexelsPhotoUrl.substring(0, 70)}...`);

      // 2. Upload to Cloudinary
      console.log(`  Uploading to Cloudinary (folder: khoj-event-banners)...`);
      const cloudinaryUrl = await uploadToCloudinary(pexelsPhotoUrl);
      console.log(`  Cloudinary URL: ${cloudinaryUrl}`);

      // 3. Update Event in Database
      await prisma.event.update({
        where: { id: event.id },
        data: { bannerImageUrl: cloudinaryUrl },
      });

      console.log(`  ✅ Successfully updated event in database.\n`);
      results.push({
        id: event.id,
        name: event.name,
        category: categoryName,
        query: searchQuery,
        pexelsUrl: pexelsPhotoUrl,
        cloudinaryUrl,
        status: 'SUCCESS',
      });
    } catch (err: any) {
      console.error(`  ❌ Error processing event "${event.name}":`, err.message || err);
      results.push({
        id: event.id,
        name: event.name,
        category: categoryName,
        query: searchQuery,
        pexelsUrl: null,
        cloudinaryUrl: null,
        status: 'FAILED',
        error: err.message || String(err),
      });
    }

    // Rate-limit grace delay (400ms)
    await sleep(400);
  }

  console.log('\n================ SUMMARY OF ASSIGNED BANNERS ================');
  console.table(
    results.map((r) => ({
      Event: r.name.substring(0, 32),
      Category: r.category,
      Query: r.query,
      Status: r.status,
      CloudinaryUrl: r.cloudinaryUrl ? r.cloudinaryUrl.substring(0, 40) + '...' : 'N/A',
    }))
  );

  console.log('\nDetailed Log:');
  results.forEach((r, idx) => {
    console.log(`\n${idx + 1}. [${r.status}] "${r.name}"`);
    console.log(`   Category:       ${r.category}`);
    console.log(`   Search Query:   "${r.query}"`);
    console.log(`   Cloudinary URL: ${r.cloudinaryUrl || 'None'}`);
  });
}

assignBanners()
  .catch((err) => {
    console.error('Fatal script error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
