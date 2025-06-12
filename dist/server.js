"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const equipmentRoutes_1 = __importDefault(require("./routes/equipmentRoutes"));
dotenv_1.default.config(); // Charge les variables d'environnement
(0, db_1.default)(); // Connexion à la base de données
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json()); // Permet à Express de parser le corps des requêtes en JSON
// Configuration CORS
// Permet uniquement à votre frontend React de faire des requêtes
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']; // URL de votre frontend Vite
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Permettre les requêtes sans 'origin' (comme les applications mobiles, Postman, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'La politique CORS de ce site ne permet pas l\'accès depuis l\'origine spécifiée.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true // Permet l'envoi de cookies d'authentification (si utilisés)
}));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/equipments', equipmentRoutes_1.default);
app.use((req, res) => {
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
app.use((err, req, res, next) => {
    console.error(err.stack); // Log l'erreur pour le débogage
    res.status(500).json({ message: err.message || 'Erreur interne du serveur' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV || 'development'}`);
    console.log(`Accès à l'API via http://localhost:${PORT}`);
});
