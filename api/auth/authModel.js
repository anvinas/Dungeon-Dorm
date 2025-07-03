const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    gamerTag: String,
    email: { type: String, unique: true },
    passwordHash: String,
    level: { type: Number, default: 1 },
    Bosses: { type: mongoose.Schema.Types.ObjectId, ref: 'Boss' },
    Currency: { type: Number, default: 0 },
    CurrentLoot: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' }],
    Character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
    isEmailVerified: { type: Boolean, default: false }
}, {
    collection: 'UserProfile' // Force UserProfile
});

module.exports = mongoose.model('UserProfile', userSchema);
