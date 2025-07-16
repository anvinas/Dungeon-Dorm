const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commonEnemySchema = new Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  class: { type: String, required: true },
  maxHP: { type: Number, required: true },
  stats: {
    strength: { type: Number, required: true },
    dexterity: { type: Number, required: true },
    intelligence: { type: Number, required: true },
    charisma: { type: Number, required: true },
    defense: { type: Number, required: true },
  },
  reward: {
    xp: { type: Number, required: true },
    gold: { type: Number, default: 0 },
    items: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
        quantity: { type: Number, default: 1 },
      }
    ]
  },
  level: { type: Number, required: true },
  location: {
    sceneName: { type: String },
    description: { type: String },
    environmentTags: [{ type: String }]
  },
  fightDialogue: { type: String },
  defeatedDialogue: { type: String },
  enemyType: {
    type: String,
    enum: ['common_enemy', 'boss'],
    default: 'common_enemy'
  }
}, { timestamps: true });

module.exports = mongoose.model('CommonEnemy', commonEnemySchema);
