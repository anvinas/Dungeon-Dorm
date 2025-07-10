// api/auth/authModel.js (CORRECTED AND COMPLETE VERSION)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    gamerTag: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    level: { type: Number, default: 1 },
    // Bosses is an ARRAY of ObjectIds to track multiple defeated bosses
    Bosses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Boss' }],
    Currency: { type: Number, default: 0 },
    // Inventory with quantity tracking (CRITICAL for shop)
    CurrentLoot: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
        quantity: { type: Number, default: 1 }
    }],
    // Character now references 'CharacterClass' (as per our previous work)
    Character: { type: mongoose.Schema.Types.ObjectId, ref: 'CharacterClass', default: null },
    // Character stats (for progression)
    currentStats: {
        strength: { type: Number, default: 0 },
        dexterity: { type: Number, default: 0 },
        intelligence: { type: Number, default: 0 },
        charisma: { type: Number, default: 0 },
        defense: { type: Number, default: 0 },
    },
    maxHP: { type: Number, default: 100 }, // User's current maxHP
    currentHP: { type: Number, default: 100 }, // User's current HP
    isEmailVerified: { type: Boolean, default: false }
}, {
    collection: 'UserProfile', // Forces the collection name to 'UserProfile'
    timestamps: true
});

module.exports = mongoose.model('UserProfile', userSchema);