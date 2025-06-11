import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Charge les variables d'environnement du fichier .env

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Erreur: MONGODB_URI non défini dans le fichier .env');
      // Termine le processus si la variable d'environnement essentielle n'est pas définie
      process.exit(1);
    }
    
    // Tente de se connecter à MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connexion à MongoDB réussie !');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    // En cas d'échec de connexion, termine l'application
    process.exit(1);
  }
};

export default connectDB;