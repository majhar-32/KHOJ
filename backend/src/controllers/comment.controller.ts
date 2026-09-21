import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Get comments for an event
export const getEventComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = String(req.params.eventId);

    const comments = await prisma.comment.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a comment
export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = String(req.params.eventId);
    const { text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!text || text.trim() === '') {
      res.status(400).json({ message: 'Comment text is required' });
      return;
    }

    // Optional: Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        userId,
        eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (comment.userId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({ message: 'Forbidden: You can only delete your own comments' });
      return;
    }

    await prisma.comment.delete({
      where: { id },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a comment
export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!text || text.trim() === '') {
      res.status(400).json({ message: 'Comment text is required' });
      return;
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (comment.userId !== userId) {
      res.status(403).json({ message: 'Forbidden: You can only edit your own comments' });
      return;
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { text },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          }
        }
      }
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
