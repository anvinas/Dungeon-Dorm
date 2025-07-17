const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    gamerTag: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    level: { type: Number, default: 1 },
    Bosses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Boss' }],
    Currency: { type: Number, default: 0 },
    CurrentLoot: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
        quantity: { type: Number, default: 1 }
    }],
    Character: { type: mongoose.Schema.Types.ObjectId, ref: 'CharacterClass', default: null },
    currentStats: {
        strength: { type: Number, default: 0 },
        dexterity: { type: Number, default: 0 },
        intelligence: { type: Number, default: 0 },
        charisma: { type: Number, default: 0 },
        defense: { type: Number, default: 0 },
    },
    maxHP: { type: Number, default: 100 },
    currentHP: { type: Number, default: 100 },
    currentActiveBoss: { type: mongoose.Schema.Types.ObjectId, ref: 'Boss', default: null },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: {
        type: Date,
        default: () => new Date(Date.now() + 60 * 60 * 1000)
    },
    activityState: { type: String, default: 'offline' },
    currentXP: { type: Number, default: 0 },
    toLevelUpXP: { type: Number, default: 1000 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: {
        type: Date,
        default: () => new Date(Date.now() + 60 * 60 * 1000)
    }
}, {
    collection: 'UserProfile',
    timestamps: true
});

module.exports = mongoose.model('UserProfile', userSchema);
