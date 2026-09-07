import { Router } from 'express';
import {
  signup,
  login,
  me,
  updateProfile,
  uploadProfilePictureHandler,
  changePassword,
  getMyStats,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { uploadProfilePicture } from '../middleware/upload';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, me);
router.put('/me', authenticate, updateProfile);
router.post('/me/picture', authenticate, uploadProfilePicture, uploadProfilePictureHandler);
router.put('/change-password', authenticate, changePassword);
router.get('/me/stats', authenticate, getMyStats);

export default router;
