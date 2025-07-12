const userProfile = require('../auth/authModel');
const Boss =  require('../global/Boss');   


async function setNextBossForUser(user) 
{
    const allBosses = await Boss.find({}).sort({level : 1});
    const defeatedBosses = user.defeatedBosses.map(id => id.toString());
    const nextBoss = allBosses.find (b => !defeatedBosses.includes(b._id.toString()));

    user.currentBoss = nextBoss ? nextBoss._id : null;
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

async function handleBossDefeat(userId, bossId) {
    const user = await userProfile.findById(userId);
    const boss = await Boss.findById(bossId);

    if (!user || !boss) 
    {
        throw new Error('User or Boss not found');
    }

    user.Currency = user.Currency + (boss.reward.gold || 0);

    let rewards = 
    {
        gold: boss.reward.gold || 0,
        items: []
    };

    if (user.defeatedBosses.includes(boss._id.toString())) 
    {
        await user.save();
        return {rewards};
    }


    for (const reward of boss.reward.items || [])
    {
        if (reward.itemId)
        {
            try {
            addItemToUser(user, reward.itemId, reward.quantity);
            rewards.items.push({
                itemId: reward.itemId._id,
                quantity: reward.quantity,
                name: reward.itemId.name
            });
        } catch (error) {
            console.error(`Error adding item to user: ${error.message}`);
        }
        }
    }

    user.defeatedBosses.push(boss._id);
    
    await user.save();
    return rewards;
}

