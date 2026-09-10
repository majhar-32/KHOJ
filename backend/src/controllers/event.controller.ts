import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { Role, EventStatus, EventMode } from '@prisma/client';

export function formatEvent(e: any) {
  return {
    id: e.id,
    name: e.name,
    category: e.category?.name || '',
    categoryId: e.categoryId,
    organizerName: e.organizer?.name || 'Unknown Organizer',
    organizerVerified: e.organizer?.verified ?? false,
    organizerId: e.organizerId,
    eventDate: e.eventDate instanceof Date ? e.eventDate.toISOString().slice(0, 10) : e.eventDate,
    eventTime: e.eventTime,
    venue: e.venue,
    city: e.city,
    mode: e.mode ? (e.mode.toLowerCase() as 'online' | 'offline') : 'offline',
    registrationDeadline: e.registrationDeadline instanceof Date ? e.registrationDeadline.toISOString().slice(0, 10) : e.registrationDeadline,
    registrationFee: e.registrationFee,
    prizePool: e.prizePool,
    eligibility: e.eligibility,
    teamSize: e.teamSize,
    availableSeats: e.availableSeats ?? null,
    certificateInfo: e.certificateInfo,
    description: e.description,
    rules: e.rules,
    contactInfo: e.contactInfo,
    registrationLink: e.registrationLink,
    officialWebsite: e.officialWebsite || '',
    bannerColor: 'primary',
    bannerImageUrl: e.bannerImageUrl || null,
    status: e.status ? (e.status.toLowerCase() as 'pending' | 'approved' | 'rejected') : 'pending',
    rejectionReason: e.rejectionReason || undefined,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

const createEventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().min(1, 'Event time is required'),
  venue: z.string().min(1, 'Venue is required'),
  city: z.string().min(1, 'City is required'),
  mode: z.enum(['online', 'offline', 'ONLINE', 'OFFLINE']),
  registrationDeadline: z.string().min(1, 'Registration deadline is required'),
  registrationFee: z.string().min(1, 'Registration fee is required'),
  prizePool: z.string().min(1, 'Prize pool is required'),
  eligibility: z.string().min(1, 'Eligibility is required'),
  teamSize: z.string().min(1, 'Team size is required'),
  availableSeats: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined || val === 'null' || val === 'undefined') return null;
    const num = Number(val);
    return isNaN(num) ? val : num;
  }, z.number().nullable().optional()),
  certificateInfo: z.string().min(1, 'Certificate info is required'),
  description: z.string().min(1, 'Description is required'),
  rules: z.string().min(1, 'Rules are required'),
  contactInfo: z.string().min(1, 'Contact info is required'),
  registrationLink: z.string().min(1, 'Registration link is required'),
  officialWebsite: z.string().optional().default(''),
});

const updateEventSchema = createEventSchema.partial();

const rejectEventSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

const eventListSelect = {
  id: true,
  name: true,
  categoryId: true,
  organizerId: true,
  eventDate: true,
  eventTime: true,
  venue: true,
  city: true,
  mode: true,
  registrationDeadline: true,
  registrationFee: true,
  prizePool: true,
  eligibility: true,
  teamSize: true,
  availableSeats: true,
  certificateInfo: true,
  contactInfo: true,
  registrationLink: true,
  officialWebsite: true,
  bannerImageUrl: true,
  status: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { name: true } },
  organizer: { select: { name: true, verified: true } },
};

export const getEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, city, mode, q } = req.query;

    // 3-day grace period cutoff: only show events whose deadline has not passed,
    // or passed within the last 3 days. Events expired > 3 days ago are excluded from public discovery.
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const where: any = {
      status: EventStatus.APPROVED,
      registrationDeadline: {
        gte: threeDaysAgo,
      },
    };

    if (category && typeof category === 'string' && category.trim() !== '') {
      where.category = {
        name: { equals: category.trim(), mode: 'insensitive' },
      };
    }

    if (city && typeof city === 'string' && city.trim() !== '') {
      where.city = { equals: city.trim(), mode: 'insensitive' };
    }

    if (mode && typeof mode === 'string' && mode.trim() !== '') {
      const upperMode = mode.trim().toUpperCase();
      if (upperMode === 'ONLINE' || upperMode === 'OFFLINE') {
        where.mode = upperMode as EventMode;
      }
    }

    if (q && typeof q === 'string' && q.trim() !== '') {
      where.name = { contains: q.trim(), mode: 'insensitive' };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { registrationDeadline: 'asc' },
      select: eventListSelect,
    });

    res.status(200).json(events.map(formatEvent));
  } catch (error) {
    next(error);
  }
};

export const getAllEventsForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      select: eventListSelect,
    });

    res.status(200).json(events.map(formatEvent));
  } catch (error) {
    next(error);
  }
};

export const getEventsByOrganizer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      where: {
        organizerId: req.user!.id,
      },
      orderBy: { createdAt: 'desc' },
      select: eventListSelect,
    });

    res.status(200).json(events.map(formatEvent));
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        organizer: { select: { name: true, verified: true } },
      },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.status(200).json(formatEvent(event));
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = createEventSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      res.status(400).json({ error: issue?.message || 'Invalid event data' });
      return;
    }

    const data = parseResult.data;

    // Look up category
    const categoryRecord = await prisma.category.findFirst({
      where: { name: { equals: data.category.trim(), mode: 'insensitive' } },
    });

    if (!categoryRecord) {
      res.status(404).json({ error: `Category "${data.category}" not found` });
      return;
    }

    const bannerImageUrl = req.file ? (req.file as any).path : null;

    const created = await prisma.event.create({
      data: {
        name: data.name,
        categoryId: categoryRecord.id,
        organizerId: req.user!.id,
        eventDate: new Date(data.eventDate),
        eventTime: data.eventTime,
        venue: data.venue,
        city: data.city,
        mode: data.mode.toUpperCase() as EventMode,
        registrationDeadline: new Date(data.registrationDeadline),
        registrationFee: data.registrationFee,
        prizePool: data.prizePool,
        eligibility: data.eligibility,
        teamSize: data.teamSize,
        availableSeats: data.availableSeats ?? null,
        certificateInfo: data.certificateInfo,
        description: data.description,
        rules: data.rules,
        contactInfo: data.contactInfo,
        registrationLink: data.registrationLink,
        officialWebsite: data.officialWebsite || '',
        bannerImageUrl: bannerImageUrl,
        status: EventStatus.PENDING,
        rejectionReason: null,
      },
      include: {
        category: { select: { name: true } },
        organizer: { select: { name: true, verified: true } },
      },
    });

    res.status(201).json(formatEvent(created));
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.event.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        organizer: { select: { name: true, verified: true } },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (req.user!.role === Role.ORGANIZER && existing.organizerId !== req.user!.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const parseResult = updateEventSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      res.status(400).json({ error: issue?.message || 'Invalid update data' });
      return;
    }

    const data = parseResult.data;
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.eventTime !== undefined) updateData.eventTime = data.eventTime;
    if (data.venue !== undefined) updateData.venue = data.venue;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.mode !== undefined) updateData.mode = data.mode.toUpperCase() as EventMode;
    if (data.eventDate !== undefined) updateData.eventDate = new Date(data.eventDate);
    if (data.registrationDeadline !== undefined) updateData.registrationDeadline = new Date(data.registrationDeadline);
    if (data.registrationFee !== undefined) updateData.registrationFee = data.registrationFee;
    if (data.prizePool !== undefined) updateData.prizePool = data.prizePool;
    if (data.eligibility !== undefined) updateData.eligibility = data.eligibility;
    if (data.teamSize !== undefined) updateData.teamSize = data.teamSize;
    if (data.availableSeats !== undefined) updateData.availableSeats = data.availableSeats;
    if (data.certificateInfo !== undefined) updateData.certificateInfo = data.certificateInfo;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.rules !== undefined) updateData.rules = data.rules;
    if (data.contactInfo !== undefined) updateData.contactInfo = data.contactInfo;
    if (data.registrationLink !== undefined) updateData.registrationLink = data.registrationLink;
    if (data.officialWebsite !== undefined) updateData.officialWebsite = data.officialWebsite;

    if (req.file) {
      updateData.bannerImageUrl = (req.file as any).path;
    }

    if (data.category !== undefined) {
      const categoryRecord = await prisma.category.findFirst({
        where: { name: { equals: data.category.trim(), mode: 'insensitive' } },
      });

      if (!categoryRecord) {
        res.status(404).json({ error: `Category "${data.category}" not found` });
        return;
      }
      updateData.categoryId = categoryRecord.id;
    }

    // Re-approval on edit: if the event was APPROVED, set it back to PENDING
    if (existing.status === EventStatus.APPROVED) {
      updateData.status = EventStatus.PENDING;
      updateData.rejectionReason = null;
    }

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { name: true } },
        organizer: { select: { name: true, verified: true } },
      },
    });

    res.status(200).json(formatEvent(updated));
  } catch (error) {
    next(error);
  }
};

export const approveEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.event.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.APPROVED,
        rejectionReason: null,
      },
      include: {
        category: { select: { name: true } },
        organizer: { select: { name: true, verified: true } },
      },
    });

    res.status(200).json(formatEvent(updated));
  } catch (error) {
    next(error);
  }
};

export const rejectEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const parseResult = rejectEventSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      res.status(400).json({ error: issue?.message || 'Rejection reason is required' });
      return;
    }

    const existing = await prisma.event.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.REJECTED,
        rejectionReason: parseResult.data.reason,
      },
      include: {
        category: { select: { name: true } },
        organizer: { select: { name: true, verified: true } },
      },
    });

    res.status(200).json(formatEvent(updated));
  } catch (error) {
    next(error);
  }
};
