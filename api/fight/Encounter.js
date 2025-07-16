const mongoose = require ('mongoose');

const encounterSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref : 'User', required: true},
    enemyId: {type: mongoose.Schema.Types.ObjectId, required: true},
    enemyType: { type: String, enum: ['common_enemy', 'boss'], required: true},
    userHP: Number,
    enemyHP: Number,
    enemyFriendliness: Number,
    isActive: {type : Boolean, default: true},
    currentTurn: {type: String, enum: ['User', 'Enemy'], default: 'User'},
    expiresAt: { type: Date, default: () => new Date(Date.now() + 1000 * 60 * 10), index: { expires: 0 } }, // expires 10 mins after creation
    }, {timestamps: true}
);

module.exports = mongoose.model('Encounter', encounterSchema);