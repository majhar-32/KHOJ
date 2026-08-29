import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required'),
});

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { name: true },
    });

    res.status(200).json(categories.map((c) => c.name));
  } catch (error) {
    next(error);
  }
};

export const getCategoriesWithCounts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    const result = categories.map((c) => ({
      id: c.id,
      name: c.name,
      count: c._count.events,
    }));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = categorySchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      res.status(400).json({ error: issue?.message || 'Invalid category name' });
      return;
    }

    const { name } = parseResult.data;

    const existing = await prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existing) {
      res.status(409).json({ error: 'A category with this name already exists' });
      return;
    }

    const created = await prisma.category.create({
      data: { name },
      select: { id: true, name: true },
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const renameCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const parseResult = categorySchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      res.status(400).json({ error: issue?.message || 'Invalid category name' });
      return;
    }

    const { name } = parseResult.data;

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Check if another category already has this name
    const duplicate = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        id: { not: id },
      },
    });

    if (duplicate) {
      res.status(409).json({ error: 'A category with this name already exists' });
      return;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name },
      select: { id: true, name: true },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const eventsCount = await prisma.event.count({
      where: { categoryId: id },
    });

    if (eventsCount > 0) {
      res.status(409).json({
        error: 'Category is in use by one or more events',
      });
      return;
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
