"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const userExists = await User_1.default.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({ message: 'L\'utilisateur avec ce nom d\'utilisateur ou cet email existe déjà' });
        }
        const user = await User_1.default.create({
            username,
            email,
            password,
            role: role || 'user', // Définit le rôle par défaut comme 'user'
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: (0, generateToken_1.default)(user._id.toString(), user.role),
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
exports.registerUser = registerUser;
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User_1.default.findOne({ username });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: (0, generateToken_1.default)(user._id.toString(), user.role),
            });
        }
        else {
            res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe invalide' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.authUser = authUser;
