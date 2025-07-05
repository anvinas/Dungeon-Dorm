// api/barkeeper/InventoryItem.js
const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    baseValue: { type: Number, default: 10 },
    healthAmount: { type: Number },
    description: { type: String },
}, {
    timestamps: true,
    // *** ADD THIS LINE IF YOUR COLLECTION IS NAMED 'InventoryItems' (Capital I) ***
    collection: 'InventoryItem' // Explicitly set to match your actual MongoDB collection name
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);