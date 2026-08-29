import { Router } from 'express';
import { extractEvent, searchEvents } from '../controllers/ai.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

// AI Event Extraction (Organizer / Admin)
router.post('/extract-event', authenticate, authorize(Role.ORGANIZER, Role.ADMIN), extractEvent);

// AI Natural Language Search (Public)
router.post('/search', searchEvents);

export default router;
