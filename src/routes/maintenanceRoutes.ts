import { Router } from 'express';
import { protect, admin } from '../middlewares/authMiddleware';
import {
  getMaintenanceRecordsByEquipment,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from '../controllers/maintenanceController';

const router = Router();

// Routes pour l'historique de maintenance
// GET pour un équipement spécifique (accessible par user si assigné, par admin toujours)
router.route('/:equipmentId').get(
  protect,
  (req, res, next) => {
    Promise.resolve(getMaintenanceRecordsByEquipment(req, res)).catch(next);
  }
);

// POST pour créer un enregistrement de maintenance (accessible par user si assigné, par admin toujours)
router.route('/').post(
  protect,
  (req, res, next) => {
    Promise.resolve(createMaintenanceRecord(req, res)).catch(next);
  }
);

// PUT et DELETE nécessitent d'être admin
router.route('/:id')
  .put(
    protect,
    admin,
    (req, res, next) => {
      Promise.resolve(updateMaintenanceRecord(req, res)).catch(next);
    }
  )
  .delete(
    protect,
    admin,
    (req, res, next) => {
      Promise.resolve(deleteMaintenanceRecord(req, res)).catch(next);
    }
  );

export default router;