"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Helper to wrap async route handlers
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// Toutes ces routes nécessitent que l'utilisateur soit authentifié ET admin
router.route('/').get(authMiddleware_1.protect, authMiddleware_1.admin, asyncHandler(userController_1.getUsers)).post(authMiddleware_1.protect, authMiddleware_1.admin, asyncHandler(userController_1.createUser));
router.route('/:id')
    .get(authMiddleware_1.protect, authMiddleware_1.admin, asyncHandler(userController_1.getUserById))
    .put(authMiddleware_1.protect, authMiddleware_1.admin, asyncHandler(userController_1.updateUser))
    .delete(authMiddleware_1.protect, authMiddleware_1.admin, asyncHandler(userController_1.deleteUser));
exports.default = router;
