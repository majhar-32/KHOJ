import { Router } from 'express';
import {
  getEvents,
  getAllEventsForAdmin,
  getEventsByOrganizer,
  getEventById,
  createEvent,
  updateEvent,
  approveEvent,
  rejectEvent,
} from '../controllers/event.controller';
import {
  getSavedEvents,
  toggleSaveEvent,
} from '../controllers/savedEvent.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

// Public events list
router.get('/', getEvents);

// Specific routes before parameterized :id route
router.get('/admin', authenticate, authorize(Role.ADMIN), getAllEventsForAdmin);
router.get('/mine', authenticate, authorize(Role.ORGANIZER), getEventsByOrganizer);
router.get('/saved', authenticate, getSavedEvents);

// Event by ID
router.get('/:id', getEventById);

// Create event
router.post('/', authenticate, authorize(Role.ORGANIZER), createEvent);

// Save / Bookmark toggle
router.post('/:id/save', authenticate, toggleSaveEvent);

// Update event
router.put('/:id', authenticate, authorize(Role.ORGANIZER, Role.ADMIN), updateEvent);

// Admin approval & rejection
router.post('/:id/approve', authenticate, authorize(Role.ADMIN), approveEvent);
router.post('/:id/reject', authenticate, authorize(Role.ADMIN), rejectEvent);

export default router;
