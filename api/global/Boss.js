// global/Boss.js
const mongoose = require('mongoose');

const BossSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    level: { type: Number, required: true }, // Crucial for progression order
    maxHP: { type: Number, default: 100 },
    friendship: {type: Number, default: 0},
    reward: { // Matches your screenshot's 'reward' field structure
        gold: { type: Number, default: 0 },
        items: [{
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
            quantity: { type: Number, default: 1 }
        }],
        experience: { type: Number, default: 0 }
    },
    location: { type: Object }, // Optional: if you don't need these, you can remove them from schema and data
    dialogues: { type: Object }, // Optional
}, {
    timestamps: true,
    collection: 'Bosses' // Explicitly setting collection name to match your DB's casing
});

module.exports = mongoose.model('Boss', BossSchema);