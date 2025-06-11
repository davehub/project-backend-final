// src/types/express.d.ts
import { Request } from 'express';
import { Document } from 'mongoose';

// Interface pour le document utilisateur MongoDB
interface IUser extends Document {
  _id: string; // Pour les opérations JWT
  username: string;
  password?: string; // Optionnel car nous allons le hascher
  role: 'admin' | 'user';
  email: string;
  firstName?: string;
  lastName?: string;
  // Ajoutez d'autres champs si nécessaire
}

// Étend l'interface Request d'Express pour inclure l'utilisateur authentifié
declare global {
  namespace Express {
    interface Request {
      user?: IUser; // L'utilisateur authentifié sera attaché ici par le middleware
    }
  }
}