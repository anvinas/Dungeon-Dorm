const mongoose = require('mongoose');

const BarKeeperSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, default: "Barkeeper" },
    shopInventory: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
            price: { type: Number, required: true }
        }
    ],
    canFight: { type: Boolean, default: false },
    fightOutcome: { type: String },
    buyMultiplier: { type: Number, default: 1.0 }, // Multiplier for when player sells to barkeeper
    dialogues: {
        welcome: { type: String },
        buyOption: { type: String },
        buySuccess: { type: String },
        buyFailInsufficientFunds: { type: String },
        sellOption: { type: String },
        sellSuccess: { type: String },
        sellFailNoItems: { type: String },
        fightChallenge: { type: String },
        kickedOut: { type: String }
    },
    location: {
        sceneName: { type: String },
        description: { type: String }
    },
    environmentTags: [{ type: String }],
    // Add any other fields you might want for the barkeeper
}, { timestamps: true });

module.exports = mongoose.model('BarKeeper', BarKeeperSchema);