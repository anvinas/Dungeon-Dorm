// api/auth/authModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    gamerTag: { type: String, required: true, unique: true }, // Added required/unique
    email: { type: String, unique: true, required: true },     // Added required
    passwordHash: { type: String, required: true },            // Added required
    level: { type: Number, default: 1 },
    Bosses: { type: mongoose.Schema.Types.ObjectId, ref: 'Boss' }, // Reference to a 'Boss' model (ensure it exists or create later)
    Currency: { type: Number, default: 0 },
    // *** CRITICAL UPDATE for inventory with quantities ***
    CurrentLoot: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' }, // Reference to InventoryItem model
        quantity: { type: Number, default: 1 }
    }],
    // ****************************************************
    Character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' }, // Reference to a 'Character' model (ensure it exists or create later)
    isEmailVerified: { type: Boolean, default: false }
}, {
    collection: 'UserProfile', // Forces the collection name to 'UserProfile' in MongoDB
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// IMPORTANT: Export the model as 'UserProfile'
module.exports = mongoose.model('UserProfile', userSchema);