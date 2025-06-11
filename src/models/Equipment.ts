import mongoose, { Document, Schema } from 'mongoose';

interface IEquipment extends Document {
  name: string;
  type: 'Ordinateur' | 'Imprimante' | 'Serveur' | 'Réseau' | 'Autre';
  serialNumber: string;
  manufacturer?: string;
  equipmentModel?: string;
  purchaseDate?: Date;
  warrantyEndDate?: Date;
  status: 'En service' | 'En panne' | 'En maintenance' | 'Hors service';
  assignedTo?: mongoose.Schema.Types.ObjectId; // Référence à l'utilisateur
  assignedToUsername?: string; // Pour un affichage plus facile côté client sans peupler
  location: string;
  notes?: string;
  // Qui a créé ou mis à jour l'équipement (optionnel)
  createdBy?: mongoose.Schema.Types.ObjectId;
  updatedBy?: mongoose.Schema.Types.ObjectId;
}

const EquipmentSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Ordinateur', 'Imprimante', 'Serveur', 'Réseau', 'Autre'], required: true },
  serialNumber: { type: String, required: true, unique: true },
  manufacturer: { type: String },
  equipmentModel: { type: String },
  purchaseDate: { type: Date },
  warrantyEndDate: { type: Date },
  status: { type: String, enum: ['En service', 'En panne', 'En maintenance', 'Hors service'], default: 'En service' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Référence à l'ID de l'utilisateur
  assignedToUsername: { type: String }, // Stocke le username pour ne pas avoir à peupler constamment
  location: { type: String, required: true },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Equipment = mongoose.model<IEquipment>('Equipment', EquipmentSchema);

export default Equipment;