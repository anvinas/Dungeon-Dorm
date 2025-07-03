const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    gamerTag: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    level: { type: Number, default: 1 },
    Bosses: { type: Object, default: {} }, // Or specific schema if known
    Currency: { type: Number, default: 0 }, // For player's money
    CurrentLoot: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
            quantity: { type: Number, default: 1 }
        }
    ],
    Character: { type: Object, default: null } // Or specific schema
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);