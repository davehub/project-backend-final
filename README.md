# Backend de Gestion de Parc Informatique
Ce projet constitue le backend de l'application de gestion de parc informatique. Il est développé avec Node.js, le framework Express, et utilise TypeScript pour une meilleure robustesse. Les données sont stockées dans MongoDB (via Mongoose), l'authentification est gérée par JSON Web Tokens (JWT), et les requêtes cross-origin sont autorisées grâce à CORS.

# Fonctionnalités
Authentification des utilisateurs : Inscription et connexion (JWT).
Gestion des utilisateurs : CRUD (Create, Read, Update, Delete) pour les administrateurs.
Gestion des équipements : CRUD pour les équipements du parc informatique.
Autorisation basée sur les rôles : Différenciation entre les utilisateurs standard et les administrateurs pour l'accès aux ressources.
Persistance des données : Utilisation de MongoDB pour le stockage.
Sécurité : Hachage des mots de passe (bcryptjs), protection des routes par token JWT.

# Technologies Utilisées
Node.js
Express.js : Framework web pour Node.js.
TypeScript : Sur-ensemble de JavaScript pour un code typé.
MongoDB : Base de données NoSQL.
Mongoose : ODM (Object Data Modeling) pour MongoDB et Node.js.
JSON Web Tokens (JWT) : Pour l'authentification stateless.
Bcryptjs : Pour le hachage sécurisé des mots de passe.
CORS : Pour la gestion des requêtes Cross-Origin.
Dotenv : Pour la gestion des variables d'environnement.
ts-node-dev : Pour le rechargement à chaud en développement avec TypeScript.


# Structure du Projet
backend/
├── src/
│   ├── config/
│   │   └── db.ts             # Configuration et connexion à MongoDB
│   ├── controllers/
│   │   ├── authController.ts # Logique d'inscription et de connexion
│   │   ├── equipmentController.ts # Logique CRUD pour les équipements
│   │   └── userController.ts # Logique CRUD pour les utilisateurs (admin)
│   ├── middleware/
│   │   └── authMiddleware.ts # Middlewares de protection et d'autorisation par rôle (admin)
│   ├── models/
│   │   ├── Equipment.ts      # Schéma et modèle Mongoose pour les équipements
│   │   └── User.ts           # Schéma et modèle Mongoose pour les utilisateurs
│   ├── routes/
│   │   ├── authRoutes.ts     # Routes d'authentification
│   │   ├── equipmentRoutes.ts # Routes des équipements
│   │   └── userRoutes.ts     # Routes de gestion des utilisateurs
│   ├── types/
│   │   └── express.d.ts      # Définitions de types TypeScript pour Express
│   ├── utils/
│   │   └── generateToken.ts  # Utilitaire pour la génération de JWT
│   └── server.ts             # Point d'entrée de l'application Express
├── .env.example            # Exemple de fichier .env (à copier et remplir)
├── .gitignore              # Fichiers et dossiers à ignorer par Git
├── package.json            # Dépendances et scripts Node.js
├── tsconfig.json           # Configuration TypeScript
└── README.md               # Ce fichier


# Prérequis
Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

Node.js (version 14 ou supérieure recommandée)
npm (Node Package Manager, généralement installé avec Node.js)
MongoDB (localement ou un cluster cloud comme MongoDB Atlas)


## Installation
Suivez ces étapes pour configurer et lancer le backend :

Clonez le dépôt (si ce n'est pas déjà fait) :

Bash

git clone <URL_DE_VOTRE_DEPOT>
cd backend
Installez les dépendances du projet :

Bash

npm install
Créez le fichier de configuration des variables d'environnement :
Copiez le fichier .env.example et renommez-le en .env.

Bash

cp .env.example .env
Configurez les variables d'environnement :
Ouvrez le fichier .env nouvellement créé et remplacez les valeurs par les vôtres :

## Extrait de code

# URI de connexion à votre base de données MongoDB
# Exemple local: mongodb://localhost:27017/computer_park_db
# Exemple Atlas: mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/<dbname>?retryWrites=true&w=majority
MONGODB_URI=mongodb://localhost:27017/computer_park_db

# Secret utilisé pour signer les JWT (JSON Web Tokens)
# Utilisez une chaîne de caractères longue et complexe !
JWT_SECRET=votreSecretSuperSecuriseEtLongPourLesTokensJWT

# Port sur lequel le serveur Express écoutera
PORT=5000
ATTENTION : Ne committez jamais votre fichier .env dans un dépôt public ! Il contient des informations sensibles.

Lancement du Serveur
Mode Développement
Pour lancer le serveur en mode développement avec rechargement à chaud (Hot Reload) :

Bash

npm run dev
Le serveur devrait démarrer sur http://localhost:5000 (ou le port spécifié dans votre .env). Vous verrez Connexion à MongoDB réussie ! si la connexion à la base de données est établie.

Mode Production
Pour construire et lancer le serveur en mode production :

Compilez le code TypeScript :

Bash

npm run build
Cela va transpiler les fichiers .ts du dossier src vers le dossier dist en tant que fichiers .js.

Lancez le serveur en production :

Bash

npm start
Points d'Accès de l'API (Endpoints)
Toutes les routes sont préfixées par /api.

Authentification (/api/auth)
POST /api/auth/register : Enregistre un nouvel utilisateur.
Corps (JSON) : { "username": "string", "email": "string", "password": "string", "role": "user" | "admin" }
Réponse : 201 Created avec les infos utilisateur et le token JWT.
Note de sécurité : En production, ne proposez pas de sélection de rôle admin sur la page d'inscription publique. Créez les administrateurs manuellement ou via un outil backend sécurisé.
POST /api/auth/login : Connecte un utilisateur existant.
Corps (JSON) : { "username": "string", "password": "string" }
Réponse : 200 OK avec les infos utilisateur et le token JWT.
Gestion des Utilisateurs (/api/users) - Accès Administrateur seulement
GET /api/users : Récupère tous les utilisateurs.
GET /api/users/:id : Récupère un utilisateur spécifique par ID.
POST /api/users : Crée un nouvel utilisateur (utilisé par un admin).
Corps (JSON) : { "username": "string", "email": "string", "password": "string", "role": "user" | "admin", "firstName": "string", "lastName": "string" }
PUT /api/users/:id : Met à jour les informations d'un utilisateur.
Corps (JSON) : { "username"?: "string", "email"?: "string", "password"?: "string", "role"?: "user" | "admin", "firstName"?: "string", "lastName"?: "string" }
DELETE /api/users/:id : Supprime un utilisateur.
Gestion des Équipements (/api/equipments)
GET /api/equipments : Récupère tous les équipements (admin) ou les équipements assignés à l'utilisateur (utilisateur standard).
GET /api/equipments/:id : Récupère un équipement spécifique par ID (accès restreint si l'utilisateur n'est pas admin et n'est pas assigné à l'équipement).
POST /api/equipments : Crée un nouvel équipement. Accès Administrateur seulement.
Corps (JSON) : { "name": "string", "type": "Ordinateur" | "Imprimante" | "Serveur" | "Réseau" | "Autre", "serialNumber": "string", "manufacturer"?: "string", "model"?: "string", "purchaseDate"?: "string (ISO Date)", "warrantyEndDate"?: "string (ISO Date)", "status"?: "En service" | "En panne" | "En maintenance" | "Hors service", "assignedTo"?: "string (username de l'utilisateur)", "location": "string", "notes"?: "string" }
PUT /api/equipments/:id : Met à jour les informations d'un équipement. Accès Administrateur seulement.
DELETE /api/equipments/:id : Supprime un équipement. Accès Administrateur seulement.
Utilisation des Tokens JWT
Pour accéder aux routes protégées, vous devez inclure le token JWT que vous recevez après une connexion réussie. Le token doit être inclus dans l'en-tête Authorization de toutes vos requêtes, au format Bearer <YOUR_JWT_TOKEN>.

## Exemple d'en-tête de requête :

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZmFlOT...
Content-Type: application/json
Déploiement
Pour déployer cette application en production, vous devrez :

Configurer vos variables d'environnement de production (par exemple, MONGODB_URI pour votre base de données en ligne, un JWT_SECRET encore plus fort, etc.).
Utiliser un processus manager comme PM2 pour maintenir l'application en ligne.
Utiliser un reverse proxy comme Nginx ou Apache.
Assurer la sécurité TLS/SSL (HTTPS).
Contributions
Les contributions sont les bienvenues ! Veuillez ouvrir une issue ou soumettre une Pull Request.

## Licence
Ce projet est sous licence MIT.