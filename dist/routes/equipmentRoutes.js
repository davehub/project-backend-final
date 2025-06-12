"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const equipmentController_1 = require("../controllers/equipmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Helper to wrap async route handlers
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Routes nécessitant une authentification
router.route('/').get(authMiddleware_1.protect, asyncHandler(equipmentController_1.getEquipments));
router.route('/:id').get(authMiddleware_1.protect, asyncHandler(equipmentController_1.getEquipmentById));
// Routes nécessitant le rôle d'administrateur
router.route('/').post(authMiddleware_1.protect, authMiddleware_1.admin, asyncHandler(equipmentController_1.createEquipment));
router.route('/:id').put(authMiddleware_1.protect, authMiddleware_1.admin, asyncHandler(equipmentController_1.updateEquipment)).delete(authMiddleware_1.protect, authMiddleware_1.admin, asyncHandler(equipmentController_1.deleteEquipment));
exports.default = router;
