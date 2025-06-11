import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // Rendu optionnel après le hachage, pour les types
  role: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  // Méthodes pour les opérations spécifiques
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  firstName: { type: String },
  lastName: { type: String },
}, { timestamps: true }); // Ajoute createdAt et updatedAt

// Hashage du mot de passe avant de sauvegarder
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
});

// Méthode pour comparer les mots de passe
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password!);
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;