// api/barkeeper/InventoryItem.js
const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    baseValue: { type: Number, default: 10 }, // Essential for selling logic (price barkeeper buys at)
    healthAmount: { type: Number }, // Optional, for potions
    description: { type: String },
    // Add other relevant item properties here (e.g., 'type', 'damage', 'rarity')
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);