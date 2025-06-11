import { Request, Response } from 'express';
import Equipment from '../models/Equipment';
import User from '../models/User'; // Pour vérifier l'existence de l'utilisateur attribué

// @desc    Get all equipments
// @route   GET /api/equipments
// @access  Private (all authenticated users)
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
export const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé' });
    }

    // Si c'est un utilisateur normal, s'assurer qu'il est bien attribué à cet équipement
    if (req.user?.role === 'user' && equipment.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé à cet équipement' });
    }

    res.json(equipment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new equipment
// @route   POST /api/equipments
// @access  Private/Admin
export const createEquipment = async (req: Request, res: Response) => {
  const {
    name, type, serialNumber, manufacturer, model,
    purchaseDate, warrantyEndDate, status, assignedTo, location, notes
  } = req.body;

  try {
    const equipmentExists = await Equipment.findOne({ serialNumber });
    if (equipmentExists) {
      return res.status(400).json({ message: 'Un équipement avec ce numéro de série existe déjà.' });
    }

    let assignedToId = undefined;
    let assignedToUsername = undefined;

    if (assignedTo) {
      const userToAssign = await User.findOne({ username: assignedTo }) as typeof User.prototype | null;
      if (!userToAssign) {
        return res.status(400).json({ message: 'Utilisateur attribué non trouvé.' });
      }
      assignedToId = userToAssign._id;
      assignedToUsername = userToAssign.username;
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
      assignedTo: assignedToId,
      assignedToUsername,
      location,
      notes,
      createdBy: req.user?._id, // Enregistre l'admin qui l'a créé
    });

    const createdEquipment = await equipment.save();
    res.status(201).json(createdEquipment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
    let assignedToUsername = assignedTo ? equipment.assignedToUsername : undefined;

    if (assignedTo) {
      const userToAssign = await User.findOne({ username: assignedTo });
      if (!userToAssign) {
        return res.status(400).json({ message: 'Utilisateur attribué non trouvé.' });
      }
      
      assignedToUsername = userToAssign.username;
    } else {
      // Si assignedTo est null ou vide, désassigner l'équipement
      assignedToId = undefined;
      assignedToUsername = undefined;
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
    equipment.assignedToUsername = assignedToUsername;
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
};