import { Router } from 'express';
import {
  getCategories,
  getCategoriesWithCounts,
  addCategory,
  renameCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

// Public categories list
router.get('/', getCategories);

// Admin-only categories endpoints (mount /counts before /:id)
router.get('/counts', authenticate, authorize(Role.ADMIN), getCategoriesWithCounts);
router.post('/', authenticate, authorize(Role.ADMIN), addCategory);
router.put('/:id', authenticate, authorize(Role.ADMIN), renameCategory);
router.delete('/:id', authenticate, authorize(Role.ADMIN), deleteCategory);

export default router;
