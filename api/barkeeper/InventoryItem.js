const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    baseValue: { type: Number, default: 10 },
    description: { type: String },
    healthAmount: { type: Number },
}, {
    timestamps: true,
    collection: 'InventoryItem' // Use your actual collection name
});

// prevent OverwriteModelError during hot reloads or repeated imports
module.exports = mongoose.models.InventoryItem || mongoose.model('InventoryItem', InventoryItemSchema);
