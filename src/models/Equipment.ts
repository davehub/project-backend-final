import mongoose, { Document, Schema } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  type: 'Ordinateur' | 'Imprimante' | 'Serveur' | 'Réseau' | 'Autre';
  serialNumber: string;
  manufacturer?: string;
  equipmentModel?: string;
  purchaseDate?: Date;
  warrantyEndDate?: Date;
  status: 'En service' | 'En panne' | 'En maintenance' | 'Hors service';
  assignedTo?: mongoose.Schema.Types.ObjectId; // Référence à l'ID de l'utilisateur
  location?: string;
  notes?: string;
  createdBy: mongoose.Schema.Types.ObjectId; // Qui a créé l'équipement (admin)
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['Ordinateur', 'Imprimante', 'Serveur', 'Réseau', 'Autre'],
    },
    serialNumber: { type: String, required: true, unique: true, trim: true },
    manufacturer: { type: String, trim: true },
    model: { type: String, trim: true },
    purchaseDate: { type: Date },
    warrantyEndDate: { type: Date },
    status: {
      type: String,
      required: true,
      enum: ['En service', 'En panne', 'En maintenance', 'Hors service'],
      default: 'En service',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // Ajout de la référence
    location: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Qui a créé
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Ajouté pour corriger l'erreur

  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema);