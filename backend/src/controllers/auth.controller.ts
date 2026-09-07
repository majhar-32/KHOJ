import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { signToken } from '../utils/jwt';
import { Role, UserStatus } from '@prisma/client';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'ORGANIZER'] as const, {
    message: 'Role must be USER or ORGANIZER',
  }),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  verified: true,
  status: true,
  dateOfBirth: true,
  institution: true,
  address: true,
  profilePictureUrl: true,
  createdAt: true,
};

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  dateOfBirth: z
    .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}/), z.literal(''), z.null()])
    .optional(),
  institution: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      res.status(400).json({ error: firstIssue?.message || 'Invalid input' });
      return;
    }

    const { name, email, password, role } = parseResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role as Role,
        verified: false,
        status: UserStatus.ACTIVE,
      },
      select: userSelect,
    });

    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      res.status(400).json({ error: firstIssue?.message || 'Invalid input' });
      return;
    }

    const { email, password } = parseResult.data;

    const userWithPassword = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!userWithPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, userWithPassword.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (userWithPassword.status === UserStatus.SUSPENDED) {
      res.status(403).json({ error: 'Account suspended' });
      return;
    }

    const user = {
      id: userWithPassword.id,
      name: userWithPassword.name,
      email: userWithPassword.email,
      role: userWithPassword.role,
      verified: userWithPassword.verified,
      status: userWithPassword.status,
      dateOfBirth: userWithPassword.dateOfBirth,
      institution: userWithPassword.institution,
      address: userWithPassword.address,
      profilePictureUrl: userWithPassword.profilePictureUrl,
      createdAt: userWithPassword.createdAt,
    };

    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    res.status(200).json({
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      res.status(400).json({ error: firstIssue?.message || 'Invalid input' });
      return;
    }

    const { name, dateOfBirth, institution, address } = parseResult.data;
    const userId = req.user!.id;

    const dataToUpdate: Record<string, unknown> = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (institution !== undefined) dataToUpdate.institution = institution;
    if (address !== undefined) dataToUpdate.address = address;
    if (dateOfBirth !== undefined) {
      dataToUpdate.dateOfBirth = dateOfBirth && dateOfBirth !== '' ? new Date(dateOfBirth) : null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: userSelect,
    });

    res.status(200).json({
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePictureHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No image file uploaded' });
      return;
    }

    const userId = req.user!.id;
    const profilePictureUrl = file.path;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePictureUrl },
      select: userSelect,
    });

    res.status(200).json({
      user: updatedUser,
      profilePictureUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      res.status(400).json({ error: firstIssue?.message || 'Invalid input' });
      return;
    }

    const { currentPassword, newPassword } = parseResult.data;
    const userId = req.user!.id;

    const userWithPassword = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userWithPassword) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, userWithPassword.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Current password does not match' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMyStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    if (user.role === 'ORGANIZER') {
      const [total, approved, pending, rejected] = await Promise.all([
        prisma.event.count({ where: { organizerId: user.id } }),
        prisma.event.count({ where: { organizerId: user.id, status: 'APPROVED' } }),
        prisma.event.count({ where: { organizerId: user.id, status: 'PENDING' } }),
        prisma.event.count({ where: { organizerId: user.id, status: 'REJECTED' } }),
      ]);

      res.status(200).json({
        role: 'ORGANIZER',
        totalEvents: total,
        approvedEvents: approved,
        pendingEvents: pending,
        rejectedEvents: rejected,
      });
      return;
    }

    const [savedCount, registeredCount] = await Promise.all([
      prisma.savedEvent.count({ where: { userId: user.id } }),
      prisma.savedEvent.count({ where: { userId: user.id, registered: true } }),
    ]);

    res.status(200).json({
      role: user.role,
      savedEventsCount: savedCount,
      registeredEventsCount: registeredCount,
    });
  } catch (error) {
    next(error);
  }
};
