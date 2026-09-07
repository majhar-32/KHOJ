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
  toggleRegisterEvent,
} from '../controllers/savedEvent.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { uploadBanner } from '../middleware/upload';
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

// Create event (with optional banner upload)
router.post('/', authenticate, authorize(Role.ORGANIZER), uploadBanner, createEvent);

// Save / Bookmark toggle
router.post('/:id/save', authenticate, toggleSaveEvent);

// Register toggle (auto-saves if not saved yet)
router.post('/:id/register', authenticate, toggleRegisterEvent);

// Update event (with optional banner upload)
router.put('/:id', authenticate, authorize(Role.ORGANIZER, Role.ADMIN), uploadBanner, updateEvent);

// Admin approval & rejection
router.post('/:id/approve', authenticate, authorize(Role.ADMIN), approveEvent);
router.post('/:id/reject', authenticate, authorize(Role.ADMIN), rejectEvent);

export default router;
