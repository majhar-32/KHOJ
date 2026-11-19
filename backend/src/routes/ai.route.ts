import { Router } from 'express';
import { extractEvent, searchEvents } from '../controllers/ai.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

// AI Event Extraction (Public / Form autofill tool)
router.post('/extract-event', extractEvent);

// AI Natural Language Search (Public)
router.post('/search', searchEvents);

export default router;
