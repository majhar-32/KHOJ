import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { getGeminiClient } from '../lib/gemini';
import { EventStatus, EventMode } from '@prisma/client';
import { formatEvent } from './event.controller';

const extractInputSchema = z.object({
  rawText: z.string().min(1, 'rawText is required'),
});

const extractedEventSchema = z.object({
  name: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  eventDate: z.string().nullable().optional(),
  eventTime: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  mode: z.enum(['online', 'offline', 'ONLINE', 'OFFLINE']).nullable().optional(),
  registrationDeadline: z.string().nullable().optional(),
  registrationFee: z.string().nullable().optional(),
  prizePool: z.string().nullable().optional(),
  eligibility: z.string().nullable().optional(),
  teamSize: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

const searchInputSchema = z.object({
  query: z.string().min(1, 'query is required'),
});

const searchFilterSchema = z.object({
  category: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  mode: z.enum(['online', 'offline', 'ONLINE', 'OFFLINE']).nullable().optional(),
  deadlineBefore: z.string().nullable().optional(),
});

export const extractEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = extractInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Valid rawText string is required' });
      return;
    }

    const { rawText } = parseResult.data;

    // Fetch valid categories from DB
    const dbCategories = await prisma.category.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });
    const categoryNames = dbCategories.map((c) => c.name);

    const prompt = `You are an intelligent data extraction assistant for an event discovery platform in Bangladesh called Khoj.
Extract structured event information from the following unstructured event announcement text.

Available Categories in the system:
${JSON.stringify(categoryNames)}

Strict Extraction Rules:
1. "name": Event title / name, else null.
2. "category": Must be one of the exact category names from the list above that best fits the event. If none fits well, leave as null.
3. "eventDate": ISO date format "YYYY-MM-DD" if found, else null.
4. "eventTime": 24-hour time format "HH:MM" (e.g. "09:00", "14:30") if found, else null.
5. "venue": Specific venue or platform if mentioned, else null.
6. "city": City name if in-person (e.g. "Dhaka", "Chattogram"), or "Online" if virtual, else null.
7. "mode": "online" or "offline" if determinable, else null.
8. "registrationDeadline": ISO date format "YYYY-MM-DD" if found, else null.
9. "registrationFee": e.g. "Free", "৳500", "500 BDT", else null.
10. "prizePool": e.g. "৳50,000", "50k BDT", else null.
11. "eligibility": e.g. "University students", "Open to all", else null.
12. "teamSize": e.g. "1-4 members", "Individual", "Team of 3", else null.
13. "description": A clean concise summary of the event description.
14. Any field that is NOT explicitly mentioned or cannot be confidently inferred must be null. NEVER invent dates, deadlines, or fees.

Return a JSON object containing keys:
{
  "name": string | null,
  "category": string | null,
  "eventDate": string | null,
  "eventTime": string | null,
  "venue": string | null,
  "city": string | null,
  "mode": "online" | "offline" | null,
  "registrationDeadline": string | null,
  "registrationFee": string | null,
  "prizePool": string | null,
  "eligibility": string | null,
  "teamSize": string | null,
  "description": string | null
}

Raw Event Text:
"""
${rawText}
"""`;

    let responseText = '';
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      responseText = response.text || '{}';
    } catch (modelErr: any) {
      console.error('Gemini API Error in extractEvent:', modelErr);
      res.status(502).json({
        error: 'AI service temporarily unavailable. Please fill the fields manually.',
        details: modelErr?.message,
      });
      return;
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(responseText);
    } catch {
      res.status(502).json({ error: 'AI returned malformed JSON response' });
      return;
    }

    const validation = extractedEventSchema.safeParse(parsedJson);
    if (!validation.success) {
      console.error('AI schema validation error:', validation.error);
      res.status(502).json({
        error: 'Extracted data failed validation',
        issues: validation.error.issues,
      });
      return;
    }

    const data = validation.data;
    if (data.mode) {
      data.mode = data.mode.toLowerCase() as 'online' | 'offline';
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const searchEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = searchInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Valid query string is required' });
      return;
    }

    const { query } = parseResult.data;

    // Fetch database categories and distinct cities
    const [categories, eventsWithCities] = await Promise.all([
      prisma.category.findMany({ select: { name: true } }),
      prisma.event.findMany({
        where: { status: EventStatus.APPROVED },
        select: { city: true },
        distinct: ['city'],
      }),
    ]);

    const categoryList = categories.map((c) => c.name);
    const cityList = eventsWithCities.map((e) => e.city).filter(Boolean);

    let parsedFilters: z.infer<typeof searchFilterSchema> = {};

    try {
      const prompt = `You are a search query parser for an event platform in Bangladesh called Khoj.
Translate the user's natural language search query into structured search filter parameters.

Available Categories in DB:
${JSON.stringify(categoryList)}

Available Cities in DB:
${JSON.stringify(cityList)}

User Query: "${query}"

Rules:
1. "category": Select the best matching category name from the list above, or null if not mentioned.
2. "city": Select the matching city from the list above, or null if not mentioned.
3. "mode": "online" if virtual/webinar/online is mentioned, "offline" if in-person/venue is mentioned, else null.
4. "deadlineBefore": ISO date "YYYY-MM-DD" if a time reference is given (e.g. "before September" -> "2026-09-01", "this week", etc.), else null.
5. If the query doesn't specify a field, set it to null. NEVER make up unmentioned criteria.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      const validation = searchFilterSchema.safeParse(parsed);
      if (validation.success) {
        parsedFilters = validation.data;
      }
    } catch (aiErr) {
      console.warn('AI query parsing failed, falling back to keyword search:', aiErr);
      parsedFilters = {};
    }

    // Build database query
    const where: any = {
      status: EventStatus.APPROVED,
    };

    let hasStructuredFilter = false;

    if (parsedFilters.category) {
      where.category = {
        name: { equals: parsedFilters.category, mode: 'insensitive' },
      };
      hasStructuredFilter = true;
    }

    if (parsedFilters.city) {
      where.city = { equals: parsedFilters.city, mode: 'insensitive' };
      hasStructuredFilter = true;
    }

    if (parsedFilters.mode) {
      where.mode = parsedFilters.mode.toUpperCase() as EventMode;
      hasStructuredFilter = true;
    }

    if (parsedFilters.deadlineBefore) {
      const date = new Date(parsedFilters.deadlineBefore);
      if (!isNaN(date.getTime())) {
        where.registrationDeadline = { lte: date };
        hasStructuredFilter = true;
      }
    }

    // Fallback: If no structured filters were identified or on fallback, search by keyword
    if (!hasStructuredFilter) {
      where.OR = [
        { name: { contains: query.trim(), mode: 'insensitive' } },
        { description: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { registrationDeadline: 'asc' },
      include: {
        category: { select: { name: true } },
        organizer: { select: { name: true, verified: true } },
      },
    });

    res.status(200).json(events.map(formatEvent));
  } catch (error) {
    next(error);
  }
};
