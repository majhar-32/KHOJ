// backend/src/utils/aiExtractor.ts

export interface ExtractedEventResult {
  name: string | null;
  category: string | null;
  eventDate: string | null;
  eventTime: string | null;
  venue: string | null;
  city: string | null;
  mode: 'online' | 'offline' | null;
  registrationDeadline: string | null;
  registrationFee: string | null;
  prizePool: string | null;
  eligibility: string | null;
  teamSize: string | null;
  contactInfo: string | null;
  registrationLink: string | null;
  officialWebsite: string | null;
  description: string | null;
}

const MONTHS: Record<string, string> = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', september: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12',
};

function parseDateString(str: string): string | null {
  // ISO: 2026-10-15
  const isoMatch = str.match(/\b(202\d)-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])\b/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  // DD/MM/YYYY
  const slashMatch = str.match(/\b([0-2]?[0-9]|3[01])[\/\.-](0?[1-9]|1[0-2])[\/\.-](202\d)\b/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    return `${slashMatch[3]}-${month}-${day}`;
  }

  // 15 March 2026 or March 15, 2026
  const textDateMatch = str.match(/\b([0-2]?[0-9]|3[01])?(?:st|nd|rd|th)?\s*([a-zA-Z]{3,9})[,\s]+([0-2]?[0-9]|3[01])?(?:st|nd|rd|th)?[,\s]*(202\d)?\b/i);
  if (textDateMatch) {
    const monthStr = textDateMatch[2].toLowerCase();
    const month = MONTHS[monthStr] || MONTHS[monthStr.slice(0, 3)];
    if (month) {
      const dayRaw = textDateMatch[1] || textDateMatch[3] || '01';
      const day = dayRaw.padStart(2, '0');
      const year = textDateMatch[4] || new Date().getFullYear().toString();
      return `${year}-${month}-${day}`;
    }
  }

  return null;
}

export function heuristicExtractEvent(
  rawText: string,
  categoryNames: string[]
): ExtractedEventResult {
  const result: ExtractedEventResult = {
    name: null,
    category: null,
    eventDate: null,
    eventTime: null,
    venue: null,
    city: null,
    mode: null,
    registrationDeadline: null,
    registrationFee: null,
    prizePool: null,
    eligibility: null,
    teamSize: null,
    contactInfo: null,
    registrationLink: null,
    officialWebsite: null,
    description: rawText.trim(),
  };

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const lower = rawText.toLowerCase();

  // 1. Event Name
  // Look for line starting with "Event:", "Title:", "Name:"
  for (const line of lines) {
    const match = line.match(/^(?:event(?:\s*name)?|title|contest|hackathon|workshop)\s*[:\-]\s*(.+)/i);
    if (match) {
      result.name = match[1].replace(/^[🔥🚀✨📢🎉\s]+/, '').trim();
      break;
    }
  }
  // Fallback: pick the first prominent line that isn't a Note, contact, link, or city name
  if (!result.name) {
    for (const line of lines) {
      const lLower = line.toLowerCase();
      const isCityLine = /^(dhaka|chattogram|sylhet|rajshahi|khulna|barishal|rangpur|mymensingh|cumilla|gazipur)(,\s*bangladesh)?$/i.test(line.trim());
      if (
        !lLower.startsWith('note:') &&
        !lLower.startsWith('যোগাযোগ') &&
        !lLower.startsWith('contact') &&
        !lLower.startsWith('phone') &&
        !lLower.startsWith('call') &&
        !lLower.startsWith('event page') &&
        !line.startsWith('—') &&
        !line.startsWith('-') &&
        !line.startsWith('http') &&
        !isCityLine &&
        line.length > 5 &&
        line.length < 120
      ) {
        result.name = line.replace(/^[🔥🚀✨📢🎉\s]+/, '').trim();
        break;
      }
    }
  }

  // If still no name, extract from URL slug (e.g. facebook.com/BIOSpellingBEE -> BIO Spelling BEE)
  if (!result.name) {
    const slugMatch = rawText.match(/facebook\.com\/([A-Za-z0-9_-]+)/i);
    if (slugMatch && slugMatch[1].length > 3) {
      result.name = slugMatch[1].replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').trim();
    }
  }

  // Contact Info extraction (Bangladeshi phone: 017..., 018..., +8801...)
  const phoneMatch = rawText.match(/(?:\+?8801|01)[3-9]\d{8}/);
  if (phoneMatch) {
    result.contactInfo = phoneMatch[0];
  }

  // Registration / Event Link extraction
  const urlMatch = rawText.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    const cleanUrl = urlMatch[0].replace(/[,;]+$/, '');
    result.registrationLink = cleanUrl;
    result.officialWebsite = cleanUrl;
  }

  // 2. Category Detection
  const categoryKeywords: Record<string, string[]> = {
    'AI Competition': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'nlp', 'build with ai'],
    'Hackathon': ['hackathon', 'hack', 'ideathon', 'datathon'],
    'Programming Contest': ['programming contest', 'coding contest', 'icpc', 'iupc', 'codeforces', 'competitive programming'],
    'Workshop': ['workshop', 'hands-on', 'bootcamp', 'masterclass', 'training'],
    'Business Case Competition': ['business case', 'case competition', 'case solve', 'business plan'],
    'Debate Competition': ['debate', 'debating', 'parliamentary debate'],
    'Olympiad': ['olympiad', 'math contest', 'physics contest', 'bdpho', 'spelling bee', 'spellingbee'],
    'Cultural Event': ['cultural', 'concert', 'music fest', 'utshob', 'drama'],
    'Webinar': ['webinar', 'zoom session', 'online session'],
    'Seminar': ['seminar', 'symposium', 'panel discussion'],
    'Career Fair': ['career fair', 'job fair', 'campus recruitment'],
    'Robotics Competition': ['robotics', 'robot', 'line follower', 'soccer bot'],
    'Gaming Tournament': ['gaming', 'esports', 'fifa', 'valorant', 'pubg'],
    'Photography Contest': ['photography', 'photo contest', 'exhibition'],
    'Design Contest': ['design contest', 'ui/ux', 'graphic design', 'poster presentation'],
  };

  for (const [cat, kws] of Object.entries(categoryKeywords)) {
    if (kws.some((kw) => lower.includes(kw))) {
      // Find exact or closest match in database categories
      const dbMatch = categoryNames.find(
        (c) => c.toLowerCase() === cat.toLowerCase() || c.toLowerCase().includes(cat.toLowerCase())
      );
      if (dbMatch) {
        result.category = dbMatch;
        break;
      }
    }
  }
  if (!result.category && categoryNames.length > 0) {
    // Exact word match
    for (const c of categoryNames) {
      if (lower.includes(c.toLowerCase())) {
        result.category = c;
        break;
      }
    }
  }

  // 3. Mode (online vs offline)
  if (lower.includes('online') || lower.includes('zoom') || lower.includes('google meet') || lower.includes('virtual')) {
    result.mode = 'online';
    result.city = 'Online';
    result.venue = 'Online';
  } else {
    result.mode = 'offline';
  }

  // 4. University / Venue & City mapping
  const universities: { name: string; venue: string; city: string }[] = [
    { name: 'metropolitan university', venue: 'Metropolitan University', city: 'Sylhet' },
    { name: 'cuet', venue: 'CUET Campus', city: 'Chattogram' },
    { name: 'buet', venue: 'BUET Campus', city: 'Dhaka' },
    { name: 'dhaka university', venue: 'Dhaka University', city: 'Dhaka' },
    { name: 'du ', venue: 'Dhaka University', city: 'Dhaka' },
    { name: 'ruet', venue: 'RUET Campus', city: 'Rajshahi' },
    { name: 'kuet', venue: 'KUET Campus', city: 'Khulna' },
    { name: 'sust', venue: 'SUST Campus', city: 'Sylhet' },
    { name: 'iut', venue: 'IUT Campus', city: 'Gazipur' },
    { name: 'nsu', venue: 'North South University', city: 'Dhaka' },
    { name: 'brac', venue: 'BRAC University', city: 'Dhaka' },
    { name: 'aiub', venue: 'AIUB Campus', city: 'Dhaka' },
    { name: 'aust', venue: 'AUST Campus', city: 'Dhaka' },
    { name: 'chattogram college', venue: 'Chattogram College', city: 'Chattogram' },
  ];

  for (const uni of universities) {
    if (lower.includes(uni.name)) {
      result.venue = uni.venue;
      if (result.mode !== 'online') {
        result.city = uni.city;
      }
      break;
    }
  }

  // If city not found from university, check cities directly
  if (!result.city) {
    const cities = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Cumilla', 'Gazipur'];
    for (const c of cities) {
      if (lower.includes(c.toLowerCase())) {
        result.city = c;
        break;
      }
    }
  }

  // Check explicit venue line
  for (const line of lines) {
    const venueMatch = line.match(/^(?:venue|location|place)\s*[:\-]\s*(.+)/i);
    if (venueMatch) {
      result.venue = venueMatch[1].trim();
      break;
    }
  }

  // 5. Date detection
  for (const line of lines) {
    const isDeadlineLine = /deadline|registration\s*(?:close|end|last\s*date)/i.test(line);
    const dateFound = parseDateString(line);
    if (dateFound) {
      if (isDeadlineLine && !result.registrationDeadline) {
        result.registrationDeadline = dateFound;
      } else if (!result.eventDate && !isDeadlineLine) {
        result.eventDate = dateFound;
      }
    }
  }

  // 6. Time detection
  const timeMatch = rawText.match(/\b(1[0-2]|0?[1-9]):([0-5][0-9])\s*(AM|PM|am|pm)\b/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    const modifier = timeMatch[3].toUpperCase();
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    result.eventTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  // 7. Registration Fee
  if (/free\b|no\s*fee|free\s*of\s*cost/i.test(rawText)) {
    result.registrationFee = 'Free';
  } else {
    const feeMatch = rawText.match(/(?:fee|registration\s*fee|cost)\s*[:\-]?\s*([৳\d,]+\s*(?:tk|bdt|taka|per\s*team|per\s*person)?)/i);
    if (feeMatch) {
      result.registrationFee = feeMatch[1].trim();
    }
  }

  // 8. Prize Pool
  const prizeMatch = rawText.match(/(?:prize\s*pool|total\s*prize|prizes|reward)\s*[:\-]?\s*([৳\d,]+\s*(?:tk|bdt|taka|lakh|\+.*)?)/i);
  if (prizeMatch) {
    result.prizePool = prizeMatch[1].trim();
  }

  // 9. Eligibility
  const eligMatch = rawText.match(/(?:eligibility|eligible|open\s*to|who\s*can\s*join)\s*[:\-]?\s*(.+)/i);
  if (eligMatch) {
    result.eligibility = eligMatch[1].trim();
  }

  // 10. Team Size
  if (/(?:individual|solo)/i.test(rawText)) {
    result.teamSize = 'Individual';
  } else if (/team/i.test(rawText)) {
    const teamSizeMatch = rawText.match(/(?:team\s*size|members?\s*per\s*team)\s*[:\-]?\s*([^,\n]+)/i);
    if (teamSizeMatch) {
      result.teamSize = teamSizeMatch[1].trim();
    } else {
      const match = rawText.match(/teams?\s*of\s*(\d+(?:-\d+)?)/i);
      result.teamSize = match ? `${match[1]} members` : 'Team';
    }
  }

  return result;
}
