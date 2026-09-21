import { Router } from 'express';
import { getEventComments, createComment, deleteComment, updateComment } from '../controllers/comment.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Get comments for a specific event
router.get('/event/:eventId', getEventComments);

// Create a new comment for a specific event
router.post('/event/:eventId', authenticate, createComment);

// Delete a comment
router.delete('/:id', authenticate, deleteComment);

// Update a comment
router.put('/:id', authenticate, updateComment);

export default router;
