// api/barkeeper/BarKeeper.js
const mongoose = require('mongoose');

const BarKeeperSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, default: "Barkeeper" },
    shopInventory: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
            price: { type: Number, required: true },
            // If you want limited stock per item per barkeeper:
            // currentStock: { type: Number, default: 1 },
            // maxStock: { type: Number, default: 1 }
        }
    ],
    canFight: { type: Boolean, default: false },
    fightOutcome: { type: String },
    buyMultiplier: { type: Number, default: 0.5 }, // Multiplier for when player sells to barkeeper (e.g., 0.5 for 50% of baseValue)
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
}, { timestamps: true });

module.exports = mongoose.model('BarKeeper', BarKeeperSchema);