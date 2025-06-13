import { Request, Response, NextFunction } from 'express';
import MaintenanceRecord, { IMaintenanceRecord } from '../models/MaintenanceRecord';
import Equipment from '../models/Equipment';
import { HydratedDocument } from 'mongoose';

// Définir une interface pour la requête étendue (si vous n'avez pas déjà express.d.ts)
declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<any>;
    }
  }
}

// @desc    Get all maintenance records for a specific equipment
// @route   GET /api/maintenances/:equipmentId
// @access  Private (User or Admin - only for assigned equipment if not admin)
const getMaintenanceRecordsByEquipment = async (req: Request, res: Response) => {
  try {
    const { equipmentId } = req.params;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé.' });
    }

    // Autorisation : seuls les admins peuvent voir tous les historiques.
    // Un utilisateur standard ne peut voir l'historique que si l'équipement lui est assigné.
    if (req.user?.role !== 'admin' && equipment.assignedTo?.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé à l\'historique de maintenance de cet équipement.' });
    }

    const records = await MaintenanceRecord.find({ equipment: equipmentId })
      .populate('performedBy', 'username email') // Qui a effectué la maintenance
      .sort({ maintenanceDate: -1 }); // Tri par date décroissante

    res.status(200).json(records);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des historiques de maintenance:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des historiques de maintenance.' });
  }
};

// @desc    Create a new maintenance record
// @route   POST /api/maintenances
// @access  Private (Admin or User if equipment is assigned to them)
const createMaintenanceRecord = async (req: Request, res: Response) => {
  try {
    const { equipmentId, maintenanceDate, description, cost, notes } = req.body;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé.' });
    }

    // Autorisation : seuls les admins ou l'utilisateur assigné peuvent créer un enregistrement
    if (req.user?.role !== 'admin' && equipment.assignedTo?.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé pour créer un enregistrement de maintenance pour cet équipement.' });
    }

    const record = new MaintenanceRecord({
      equipment: equipmentId,
      maintenanceDate: maintenanceDate || Date.now(),
      description,
      cost,
      notes,
      performedBy: req.user!._id, // L'utilisateur connecté effectue l'opération
    });

    const savedRecord = await record.save();
    await savedRecord.populate('performedBy', 'username email');
    await savedRecord.populate('equipment', 'name serialNumber'); // Populate l'équipement aussi

    res.status(201).json(savedRecord);
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'enregistrement de maintenance:', error);
    if (error.name === 'ValidationError') {
      let messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'enregistrement de maintenance.' });
  }
};

// @desc    Update a maintenance record
// @route   PUT /api/maintenances/:id
// @access  Private (Admin only)
const updateMaintenanceRecord = async (req: Request, res: Response) => {
  try {
    // Seuls les admins peuvent modifier les enregistrements de maintenance
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent modifier les enregistrements de maintenance.' });
    }

    const { id } = req.params;
    const { maintenanceDate, description, cost, notes } = req.body;

    const updatedRecord = await MaintenanceRecord.findByIdAndUpdate(
      id,
      { maintenanceDate, description, cost, notes },
      { new: true, runValidators: true }
    )
      .populate('performedBy', 'username email')
      .populate('equipment', 'name serialNumber');

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Enregistrement de maintenance non trouvé.' });
    }

    res.status(200).json(updatedRecord);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'enregistrement de maintenance:', error);
    if (error.name === 'ValidationError') {
      let messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'enregistrement de maintenance.' });
  }
};

// @desc    Delete a maintenance record
// @route   DELETE /api/maintenances/:id
// @access  Private (Admin only)
const deleteMaintenanceRecord = async (req: Request, res: Response) => {
  try {
    // Seuls les admins peuvent supprimer les enregistrements de maintenance
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent supprimer les enregistrements de maintenance.' });
    }

    const { id } = req.params;
    const deletedRecord = await MaintenanceRecord.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: 'Enregistrement de maintenance non trouvé.' });
    }

    res.status(200).json({ message: 'Enregistrement de maintenance supprimé avec succès.' });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'enregistrement de maintenance:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'enregistrement de maintenance.' });
  }
};

export {
  getMaintenanceRecordsByEquipment,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
};