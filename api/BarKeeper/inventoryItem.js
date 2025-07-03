const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    healthAmount: { type: Number }, // Optional, for potions
    description: { type: String },
    // Add other relevant item properties if you have them, e.g., 'type', 'damage', etc.
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);