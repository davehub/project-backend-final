import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (id: string, role: string) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET non défini dans les variables d\'environnement');
  }
  return jwt.sign({ id, role }, jwtSecret, {
    expiresIn: '1h', // Durée de validité du token
  });
};

export default generateToken;