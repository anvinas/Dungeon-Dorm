// api/auth/authModel.js (UPDATED for CurrentLoot to include quantity)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    gamerTag: { type: String, required: true, unique: true }, // Added required/unique for gamerTag
    email: { type: String, unique: true, required: true },     // Added required
    passwordHash: { type: String, required: true },            // Added required
    level: { type: Number, default: 1 },
    Bosses: { type: mongoose.Schema.Types.ObjectId, ref: 'Boss' }, // Ensure 'Boss' model exists
    Currency: { type: Number, default: 0 },
    // *** CRITICAL CHANGE HERE ***
    CurrentLoot: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
        quantity: { type: Number, default: 1 }
    }],
    // **************************
    Character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' }, // Ensure 'Character' model exists
    isEmailVerified: { type: Boolean, default: false }
}, {
    collection: 'UserProfile', // Force UserProfile collection name
    timestamps: true // Good practice to add for created/updated timestamps
});

// IMPORTANT: Export as 'UserProfile'
module.exports = mongoose.model('UserProfile', userSchema);