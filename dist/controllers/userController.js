"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.find({}).select('-password'); // Ne pas renvoyer les mots de passe
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUsers = getUsers;
// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUserById = getUserById;
// @desc    Create a new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    const { username, email, password, role, firstName, lastName } = req.body;
    try {
        const userExists = await User_1.default.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({ message: 'Un utilisateur avec ce nom d\'utilisateur ou cet email existe déjà' });
        }
        const user = await User_1.default.create({
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
        }
        else {
            res.status(400).json({ message: 'Données utilisateur invalides' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createUser = createUser;
// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    const { username, email, password, role, firstName, lastName } = req.body;
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        // Vérifier si le nouveau username ou email existe déjà pour un AUTRE utilisateur
        if (username && username !== user.username) {
            const existingUser = await User_1.default.findOne({ username });
            if (existingUser && existingUser._id.toString() !== req.params.id) {
                return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris.' });
            }
        }
        user.username = username || user.username;
        user.email = email || user.email;
        user.firstName = firstName !== undefined ? firstName : user.firstName; // Permet de vider
        user.lastName = lastName !== undefined ? lastName : user.lastName; // Permet de vider
        user.role = role || user.role;
        if (password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            user.password = await bcryptjs_1.default.hash(password, salt);
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateUser = updateUser;
// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        // Empêcher l'administrateur de supprimer le dernier admin ou lui-même si c'est le seul admin
        // Cela nécessite une logique plus complexe si vous avez plusieurs admins
        if (user.role === 'admin' && (await User_1.default.countDocuments({ role: 'admin' })) <= 1) {
            return res.status(400).json({ message: 'Impossible de supprimer le dernier administrateur.' });
        }
        // Empêcher un admin de se supprimer lui-même (si vous voulez cette règle)
        if (req.user && String(user._id) === String(req.user._id)) {
            return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte administrateur.' });
        }
        await User_1.default.deleteOne({ _id: user._id }); // Utiliser deleteOne pour la compatibilité Mongoose 6+
        res.json({ message: 'Utilisateur supprimé avec succès' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteUser = deleteUser;
