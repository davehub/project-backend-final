import mongoose, { Document, Schema } from 'mongoose';

export interface IMaintenanceRecord extends Document {
  equipment: mongoose.Schema.Types.ObjectId; // Référence à l'équipement
  maintenanceDate: Date;
  description: string;
  performedBy: mongoose.Schema.Types.ObjectId; // Qui a effectué la maintenance (utilisateur ou admin)
  cost?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRecordSchema: Schema = new Schema(
  {
    equipment: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true },
    maintenanceDate: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true, trim: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cost: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMaintenanceRecord>('MaintenanceRecord', MaintenanceRecordSchema);