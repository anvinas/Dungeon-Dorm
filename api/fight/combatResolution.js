const userProfile = require('../auth/authModel');
const Boss =  require('../global/Boss');  
const {loadEntity} = require('./fightController');

async function setNextBossForUser(user) 
{
    const allBosses = await Boss.find({}).sort({level : 1});
    const defeatedBosses = user.Bosses.map(id => id.toString());
    const nextBoss = allBosses.find (b => !defeatedBosses.includes(b._id.toString()));

    user.currentBoss = nextBoss ? nextBoss._id : null;
    await user.save();
    return nextBoss;
}

function addItemToUser(user, itemId, quantity) {
    if (!itemiId) throw new Error('Item does not exist!');
    const existingItem = user.currentLoot.findIndex(loot => loot.itemId && loot.itemId.toString() === itemId.toString());

    if (existingItem > -1) {
        user.currentLoot[existingItem].quantity += quantity;    
    } else {
        user.currentLoot.push({ itemId, quantity });
    }
}

module.exports = async function handleEnemyDefeat(userId, enemyId, enemyType) {
    const user = await loadEntity(userId, 'User');
    const enemy = await loadEntity(enemyId, enemyType);
    let levelupTrigger = false;

    if (!user || !enemy) 
    {
        throw new Error('User or Boss not found');
    }

    user.Currency = user.Currency + (enemy.reward.gold || 0);
    user.currentXP = user.currentXP + (enemy.reward.xp || 0);

    if (user.CurrentXP >= user.toLevelUpXP)
    {
        levelupTrigger = true;
    }

    let rewards = 
    {
        gold: enemy.reward.gold || 0,
        items: [],
        xp: enemy.reward.xp || 0,
        readyToLevelUp: levelupTrigger
    };

    if (user.defeatedBosses.includes(enemy._id.toString())) 
    {
        await user.save();
        return {rewards};
    }

    for (const reward of enemy.reward.items || [])
    {
        if (reward.itemId)
        {
            try {
                addItemToUser(user, reward.itemId, reward.quantity);
                rewards.items.push({
                    itemId: reward.itemId._id,
                    quantity: reward.quantity,
                    itemType: reward.itemId.itemType,
                    itemDescription: reward.itemId.description,
                    itemName: reward.itemId.name
                });
            } catch (error) {
                console.error(`Error adding item to user: ${error.message}`);
            }
        }
    }

    user.defeatedBosses.push(enemy._id);

    const nextBoss = await setNextBossForUser(user);
    user.currentBoss = nextBoss ? nextBoss._id : null;
    
    await user.save();
    return rewards;
}

module.exports = {
    setNextBossForUser
}