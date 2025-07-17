// api/barkeeper/InventoryItem.js
const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    baseValue: { type: Number, default: 10 },
    healthAmount: { type: Number },
    description: { type: String },
    // >>> THIS MUST BE 'itemType' AND MATCH YOUR DATA <<<
    itemType: { // <--- ENSURE THIS IS 'itemType'
        type: String,
        enum: ['Weapon', 'Potion', 'Key'], // Ensure these enum values match your data's capitalization exactly
        required: true
    },
    damageModifier: { type: Number, default: 0 },
    damage: { type: Number }, // As per your data
    imageURL: { type: String, default: null } // As per your data
}, {
    timestamps: true,
    collection: 'InventoryItem'
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);