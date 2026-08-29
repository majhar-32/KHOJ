import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { UserStatus } from '@prisma/client';

export function formatUser(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role ? u.role.toLowerCase() : 'user',
    verified: u.verified,
    status: u.status ? u.status.toLowerCase() : 'active',
    joinedDate: u.createdAt instanceof Date ? u.createdAt.toISOString().slice(0, 10) : String(u.createdAt).slice(0, 10),
  };
}

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(200).json(users.map(formatUser));
  } catch (error) {
    next(error);
  }
};

export const suspendUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    if (id === req.user!.id) {
      res.status(403).json({ error: 'Cannot suspend your own account' });
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: UserStatus.SUSPENDED },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(200).json(formatUser(updated));
  } catch (error) {
    next(error);
  }
};

export const reactivateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: UserStatus.ACTIVE },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(200).json(formatUser(updated));
  } catch (error) {
    next(error);
  }
};
