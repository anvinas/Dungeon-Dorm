// api/barkeeper/BarKeeper.js
const mongoose = require('mongoose');

const BarKeeperSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, default: "Barkeeper" },
    shopInventory: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
            price: { type: Number, required: true },
        }
    ],
    canFight: { type: Boolean, default: false },
    fightOutcome: { type: String },
    buyMultiplier: { type: Number, default: 0.5 },
    dialogues: {
        welcome: { type: String },
        buyOption: { type: String },
        buySuccess: { type: String },
        buyFailInsufficientFunds: { type: String },
        sellOption: { type: String },
        sellSuccess: { type : String },
        sellFailNoItems: { type: String },
        fightChallenge: { type: String },
        kickedOut: { type: String }
    },
    location: {
        sceneName: { type: String },
        description: { type: String }
    },
    environmentTags: [{ type: String }],
}, {
    timestamps: true,
    // *** ADD THIS LINE ***
    collection: 'BarKeeper' // Explicitly set the collection name to match MongoDB Compass
});

module.exports = mongoose.model('BarKeeper', BarKeeperSchema);