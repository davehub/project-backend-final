import express, { RequestHandler } from 'express';
import { registerUser, authUser } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser as RequestHandler);
router.post('/login', authUser as RequestHandler);

export default router;