import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password'); // Ne pas renvoyer les mots de passe
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req: Request, res: Response) => {
  const { username, email, password, role, firstName, lastName } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });

    if (userExists) {
      return res.status(400).json({ message: 'Un utilisateur avec ce nom d\'utilisateur ou cet email existe déjà' });
    }

    const user = await User.create({
      username,
      email,
      // Le mot de passe sera haché par le middleware 'pre save' du modèle
      password,
      role: role || 'user',
      firstName,
      lastName,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } else {
      res.status(400).json({ message: 'Données utilisateur invalides' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response) => {
  const { username, email, password, role, firstName, lastName } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si le nouveau username ou email existe déjà pour un AUTRE utilisateur
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && (existingUser._id as unknown as string).toString() !== req.params.id) {
        return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris.' });
      }
    }
  

    user.username = username || user.username;
    user.email = email || user.email;
    user.firstName = firstName !== undefined ? firstName : user.firstName; // Permet de vider
    user.lastName = lastName !== undefined ? lastName : user.lastName; // Permet de vider
    user.role = role || user.role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Empêcher l'administrateur de supprimer le dernier admin ou lui-même si c'est le seul admin
    // Cela nécessite une logique plus complexe si vous avez plusieurs admins
    if (user.role === 'admin' && (await User.countDocuments({ role: 'admin' })) <= 1) {
      return res.status(400).json({ message: 'Impossible de supprimer le dernier administrateur.' });
    }
    // Empêcher un admin de se supprimer lui-même (si vous voulez cette règle)
    if (req.user && String(user._id) === String(req.user._id)) {
        return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte administrateur.' });
    }


    await User.deleteOne({ _id: user._id }); // Utiliser deleteOne pour la compatibilité Mongoose 6+
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};