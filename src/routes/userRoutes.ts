import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

// Helper to wrap async route handlers
const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Toutes ces routes nécessitent que l'utilisateur soit authentifié ET admin
router.route('/').get(protect, admin, asyncHandler(getUsers)).post(protect, admin, asyncHandler(createUser));
router.route('/:id')
  .get(protect, admin, asyncHandler(getUserById))
  .put(protect, admin, asyncHandler(updateUser))
  .delete(protect, admin, asyncHandler(deleteUser));

export default router;