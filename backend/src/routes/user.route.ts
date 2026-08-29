import { Router } from 'express';
import {
  getUsers,
  suspendUser,
  reactivateUser,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

// Protect all routes in this router with ADMIN authorization
router.use(authenticate, authorize(Role.ADMIN));

router.get('/', getUsers);
router.post('/:id/suspend', suspendUser);
router.post('/:id/reactivate', reactivateUser);

export default router;
