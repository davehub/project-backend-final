import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import equipmentRoutes from './routes/equipmentRoutes';

dotenv.config(); // Charge les variables d'environnement

connectDB(); // Connexion à la base de données

const app = express();

// Middleware
app.use(express.json()); // Permet à Express de parser le corps des requêtes en JSON

// Configuration CORS
// Permet uniquement à votre frontend React de faire des requêtes
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']; // URL de votre frontend Vite
app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans 'origin' (comme les applications mobiles, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La politique CORS de ce site ne permet pas l\'accès depuis l\'origine spécifiée.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Permet l'envoi de cookies d'authentification (si utilisés)
}));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/maintenances', maintenanceRoutes);

app.use((req,res)=>{
  res.send('Bienvenue sur l\'API de gestion de parc informatique');
});

// Route de test
app.get('/', (req, res) => {
  res.send('API de gestion de parc informatique en cours d\'exécution...');
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware de gestion des erreurs génériques (à mettre après les routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack); // Log l'erreur pour le débogage
  res.status(500).json({ message: err.message || 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV || 'development'}`);
  console.log(`Accès à l'API via http://localhost:${PORT}`);
});