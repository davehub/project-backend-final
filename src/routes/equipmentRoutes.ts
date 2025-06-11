import express from 'express';
import {
  getEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from '../controllers/equipmentController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

// Helper to wrap async route handlers
const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Routes nécessitant une authentification
router.route('/').get(protect, asyncHandler(getEquipments));
router.route('/:id').get(protect, asyncHandler(getEquipmentById));

// Routes nécessitant le rôle d'administrateur
router.route('/').post(protect, admin, asyncHandler(createEquipment));
router.route('/:id').put(protect, admin, asyncHandler(updateEquipment)).delete(protect, admin, asyncHandler(deleteEquipment));

export default router;