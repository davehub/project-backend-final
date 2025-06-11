import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  id: string;
  role: 'admin' | 'user';
}

// Middleware pour protéger les routes, s'assurer que l'utilisateur est authentifié
const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Vérifie si l'en-tête Authorization est présent et commence par 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrait le token de l'en-tête
      token = req.headers.authorization.split(' ')[1];

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET non défini dans les variables d\'environnement');
      }

      // Vérifie et décode le token
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      // Trouve l'utilisateur par l'ID du token et l'attache à l'objet de requête (sans le mot de passe)
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        // Attach a plain user object to req.currentUser to avoid type conflicts
        (req as any).currentUser = {
          ...user.toObject(),
          _id: String((user as any)._id),
        };
      } else {
        (req as any).currentUser = undefined;
      }

      if (!req.user) {
        // Si l'utilisateur n'est pas trouvé (par ex. supprimé de la DB)
        res.status(401).json({ message: 'Non autorisé, utilisateur non trouvé' });
        return;
      }

      next(); // Passe au middleware/contrôleur suivant
    } catch (error: any) {
      console.error(error); // Log l'erreur pour le débogage serveur
      res.status(401).json({ message: 'Non autorisé, token invalide ou expiré' });
    }
  }

  // Si aucun token n'est fourni dans l'en-tête
  if (!token) {
    res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
  }
};

const admin = (req: Request, res: Response, next: NextFunction) => {
  // Vérifie si l'utilisateur est attaché à la requête (par le middleware 'protect') et s'il a le rôle 'admin'
  const currentUser = (req as any).currentUser;
  if (currentUser && currentUser.role === 'admin') {
    next(); // L'utilisateur est admin, passe au middleware/contrôleur suivant
  } else {
    // L'utilisateur n'est pas admin ou n'est pas authentifié
    res.status(403).json({ message: 'Non autorisé, seuls les administrateurs peuvent accéder à cette ressource' });
  }
};


export { protect, admin };