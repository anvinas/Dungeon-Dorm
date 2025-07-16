// models/CharacterClass.js
const mongoose = require('mongoose');

const CharacterClassSchema = new mongoose.Schema({
    species: { type: String, required: true, unique: true }, // e.g., "Elf", "Human", "Orc"
    class: { type: String, required: true },               // e.g., "Warlock", "Bard", "Barbarian"
    maxHP: { type: Number, default: 100 },                 // Max Health Points for this class
    stats: {
        strength: { type: Number, default: 0 },
        dexterity: { type: Number, default: 0 },
        intelligence: { type: Number, default: 0 },
        charisma: { type: Number, default: 0 },
        defense: { type: Number, default: 0 },
    },
    gold: { type: Number, default: 0 },                   // Initial gold for this class
    // This now references an InventoryItem by its _id
    weapon: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
}, {
    timestamps: true,
    collection: 'CharacterClass' // Explicitly set collection name
});

module.exports = mongoose.model('CharacterClass', CharacterClassSchema);