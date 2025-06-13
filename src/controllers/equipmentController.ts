import { Request, Response } from 'express';
import Equipment from '../models/Equipment';
import User from '../models/User';
import { HydratedDocument } from 'mongoose';

// @desc    Get all equipments
// @route   GET /api/equipments
// @access  Private (all authenticated users)

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<any>; // Ou votre interface IUser si vous l'avez définie
    }
  }
}

export const getEquipments = async (req: Request, res: Response) => {
  try {
    // Si l'utilisateur est un 'user', ne montrer que ses équipements attribués
    if (req.user?.role === 'user') {
      const equipments = await Equipment.find({ assignedTo: req.user._id });
      return res.json(equipments);
    }
    // Si l'utilisateur est 'admin', montrer tous les équipements
    const equipments = await Equipment.find({});
    res.json(equipments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single equipment by ID
// @route   GET /api/equipments/:id
// @access  Private (all authenticated users, but check ownership for 'user' role)


// @desc    Create a new equipment
// @route   POST /api/equipments
// @access  Private/Admin
const createEquipment = async (req: Request, res: Response) => {
  try {
    // Seuls les admins peuvent créer un équipement
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Seuls les administrateurs peuvent créer des équipements.' });
    }

    const { name, type, serialNumber, manufacturer, model, purchaseDate, warrantyEndDate, status, assignedTo, location, notes } = req.body;

    let assignedUserId = null;
    if (assignedTo) {
      // Trouver l'utilisateur par son ID ou username si assignedTo est une chaîne
      const userToAssign = await User.findById(assignedTo) || await User.findOne({ username: assignedTo });
      if (!userToAssign) {
        return res.status(400).json({ message: 'Utilisateur assigné non trouvé.' });
      }
      assignedUserId = userToAssign._id;
    }

    const equipment = new Equipment({
      name,
      type,
      serialNumber,
      manufacturer,
      model,
      purchaseDate,
      warrantyEndDate,
      status,
      assignedTo: assignedUserId, // Utilise l'ID de l'utilisateur
      location,
      notes,
      createdBy: req.user!._id,
      updatedBy: req.user?._id
      // L'ID de l'utilisateur admin connecté
    });

    const savedEquipment = await equipment.save();

    // Populate les champs pour la réponse
    await savedEquipment.populate('assignedTo', 'username email');
    await savedEquipment.populate('createdBy', 'username email');

    res.status(201).json(savedEquipment);
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'équipement:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Le numéro de série doit être unique.' });
    }
    if (error.name === 'ValidationError') {
      let messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'équipement.' });
  }
};


const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email');

    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé.' });
    }

    // Si non admin, ne peut voir que son propre équipement
    if (
      req.user?.role !== 'admin' &&
      equipment.assignedTo?.toString() !== req.user?._id.toString()
    ) {
      return res.status(403).json({ message: 'Accès refusé à cet équipement.' });
    }

    res.status(200).json(equipment);
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'équipement par ID:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'équipement.' });
  }
};


// @desc    Update an equipment
// @route   PUT /api/equipments/:id
// @access  Private/Admin
export const updateEquipment = async (req: Request, res: Response) => {
  const {
    name, type, serialNumber, manufacturer, model,
    purchaseDate, warrantyEndDate, status, assignedTo, location, notes
  } = req.body;

  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé' });
    }

    // Vérifier si le nouveau numéro de série existe déjà pour un AUTRE équipement
    if (serialNumber && serialNumber !== equipment.serialNumber) {
      const existingEquipment = await Equipment.findOne({ serialNumber }) as any;
      if (existingEquipment && existingEquipment._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Un autre équipement utilise déjà ce numéro de série.' });
      }
    }

    let assignedToId = assignedTo ? equipment.assignedTo : undefined;

    if (assignedTo) {
      const userToAssign = await User.findOne({ username: assignedTo }) as HydratedDocument<any> | null;
      if (!userToAssign) {
        return res.status(400).json({ message: 'Utilisateur attribué non trouvé.' });
      }
      assignedToId = userToAssign._id;
    } else {
      // Si assignedTo est null ou vide, désassigner l'équipement
      assignedToId = undefined;
    }

    equipment.name = name || equipment.name;
    equipment.type = type || equipment.type;
    equipment.serialNumber = serialNumber || equipment.serialNumber;
    equipment.manufacturer = manufacturer || equipment.manufacturer;
    equipment.model = model || equipment.model;
    equipment.purchaseDate = purchaseDate || equipment.purchaseDate;
    equipment.warrantyEndDate = warrantyEndDate || equipment.warrantyEndDate;
    equipment.status = status || equipment.status;
    equipment.assignedTo = assignedToId;
    equipment.location = location || equipment.location;
    equipment.notes = notes !== undefined ? notes : equipment.notes; // Permet de mettre notes à vide
    equipment.updatedBy = req.user?._id ? new (require('mongoose').Types.ObjectId)(req.user._id) : undefined;

    const updatedEquipment = await equipment.save();
    res.json(updatedEquipment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an equipment
// @route   DELETE /api/equipments/:id
// @access  Private/Admin
export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé' });
    }

    res.json({ message: 'Équipement supprimé avec succès' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }

}
export default {
  getEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};