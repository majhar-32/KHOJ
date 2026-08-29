import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { formatEvent } from './event.controller';

export const getSavedEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const savedRecords = await prisma.savedEvent.findMany({
      where: { userId },
      orderBy: { savedAt: 'desc' },
      include: {
        event: {
          include: {
            category: {
              select: { name: true },
            },
            organizer: {
              select: { name: true, verified: true },
            },
          },
        },
      },
    });

    const formattedEvents = savedRecords
      .filter((record) => Boolean(record.event))
      .map((record) => ({
        ...formatEvent(record.event),
        saved: true,
      }));

    res.status(200).json(formattedEvents);
  } catch (error) {
    next(error);
  }
};

export const toggleSaveEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const eventId = String(req.params.id || req.params.eventId);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const existing = await prisma.savedEvent.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existing) {
      await prisma.savedEvent.delete({
        where: { id: existing.id },
      });
      res.status(200).json({ saved: false });
      return;
    }

    try {
      await prisma.savedEvent.create({
        data: {
          userId,
          eventId,
        },
      });
      res.status(200).json({ saved: true });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        res.status(200).json({ saved: true });
        return;
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};
