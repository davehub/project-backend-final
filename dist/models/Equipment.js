"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const EquipmentSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Ordinateur', 'Imprimante', 'Serveur', 'Réseau', 'Autre'], required: true },
    serialNumber: { type: String, required: true, unique: true },
    manufacturer: { type: String },
    equipmentModel: { type: String },
    purchaseDate: { type: Date },
    warrantyEndDate: { type: Date },
    status: { type: String, enum: ['En service', 'En panne', 'En maintenance', 'Hors service'], default: 'En service' },
    assignedTo: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }, // Référence à l'ID de l'utilisateur
    assignedToUsername: { type: String }, // Stocke le username pour ne pas avoir à peupler constamment
    location: { type: String, required: true },
    notes: { type: String },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
const Equipment = mongoose_1.default.model('Equipment', EquipmentSchema);
exports.default = Equipment;
