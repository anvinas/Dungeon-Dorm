const User = require('../auth/authModel');
const Boss = require('../global/Boss');
const CommonEnemy = require('../global/CommonEnemy');
const createToken = require('../global/refreshToken');
// const { handleEnemyDefeat } = require('./combatResolution');
const Encounter = require('./Encounter');

async function loadEntity(id, type) {
  if (!id || !type) throw new Error('Missing id or type for loadEntity');

  switch (type) {
    case 'User':
      return await User.findById(id).populate('CurrentLoot.itemId');
    case 'boss':
      return await Boss.findById(id);
    case 'common_enemy':
      return await CommonEnemy.findById(id);
    default:
      throw new Error(`Unknown entity type: ${type}`);
  }
}

const classGrowthRules = {
  Barbarian: (stats, level) => {
    const updatedStats = { 
      strength: stats.strength + 1,                           // +1 every level
      dexterity: stats.dexterity + (level % 3 === 0 ? 1 : 0), // +1 every 3rd level
      intelligence: stats.intelligence,                       // No increase
      charisma: stats.charisma + (level % 3 === 0 ? 1 : 0),   // +1 every 3rd level
      defense: stats.defense + 1,                             // +1 every level
    };

    const maxHP =
      100 +
      12 * updatedStats.defense +
      7 * updatedStats.strength +
      6 * updatedStats.dexterity +
      8 * updatedStats.intelligence;

    return {
      ...updatedStats,
      maxHP
    };
  },

  Rogue: (stats, level) => {
    const updatedStats = { 
      strength: stats.strength + (level % 3 === 0 ? 1 : 0),    // +1 every 3rd level
      dexterity: stats.dexterity + 1,                          // +1 every level
      intelligence: stats.intelligence,                        // No increase
      charisma: stats.charisma + (level % 2 === 0 ? 1 : 0),    // +1 every 2nd level
      defense: stats.defense + 1,                              // +1 every level
    };

    const maxHP =
      100 +
      12 * updatedStats.defense +
      7 * updatedStats.strength +
      6 * updatedStats.dexterity +
      8 * updatedStats.intelligence;

    return {
      ...updatedStats,
      maxHP
    };
  },

  Bard: (stats, level) => {
    const updatedStats = { 
      strength: stats.strength + (level % 3 === 0 ? 1 : 0),         // +1 every 3rd level
      dexterity: stats.dexterity + (level % 2 === 0 ? 1 : 0),       // +1 every 2nd level
      intelligence: stats.intelligence + (level % 2 === 0 ? 1 : 0), // +1 every 2nd level
      charisma: stats.charisma + 1,                                 // +1 every level
      defense: stats.defense + (level % 3 === 0 ? 1 : 0),           // +1 every 3rd level
    };

    const maxHP =
      100 +
      12 * updatedStats.defense +
      7 * updatedStats.strength +
      6 * updatedStats.dexterity +
      8 * updatedStats.intelligence;

    return {
      ...updatedStats,
      maxHP
    };
  },

  Warlock: (stats, level) => {
    const updatedStats = { 
      strength: stats.strength,                                // No increase
      dexterity: stats.dexterity + (level % 2 === 0 ? 1 : 0),  // +1 every 2nd level
      intelligence: stats.intelligence + 1,                    // +1 every level
      charisma: stats.charisma + (level % 4 === 0 ? 1 : 0),    // +1 every 4th level
      defense: stats.defense + (level % 3 === 0 ? 1 : 0),      // +1 every 3rd level
    };

    const maxHP =
      100 +
      12 * updatedStats.defense +
      7 * updatedStats.strength +
      6 * updatedStats.dexterity +
      8 * updatedStats.intelligence;

    return {
      ...updatedStats,
      maxHP
    };
  },
};

function applyStatGrowth(className, currentStats, level) //Class name, current stats, level leveling up to
{
    const growthFunction = classGrowthRules[className];

    if (!growthFunction){
        throw new Error(`Unknown class: ${className}`);
    }

    return growthFunction(currentStats, level);
}

exports.levelupUser = async (req, res) => {
    const userId = req.user.userId;
    const user = await UserProfile.findById(userId).populate('Character');

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    if (user.xp < user.toLevelUpXP) {
        return res.status(400).json({ error: 'Not enough XP to level up' });
    }
    if (user.level >= 10){
        return res.status(400).json({ error: 'Maximum level reached' });
    }

    user.xp = user.xp - user.toLevelUpXP;
    user.level = user.level + 1;


    const newStats = applyStatGrowth(user.Character.class, user.stats, user.level);

    user.stats.strength = newStats.strength;
    user.stats.dexterity = newStats.dexterity;
    user.stats.intelligence = newStats.intelligence;
    user.stats.charisma = newStats.charisma;
    user.maxHP = newStats.maxHP;
    user.currentHP = newStats.maxHP; //currentHP exists in the databse, should be removed but fine for now
    user.toLevelUpXP = 1000 + (150 * user.level); //example formula, can be changed

    await user.save();
    
    if (user.level === 10) {
        return res.json({
            message: `Congratulations! You have reached the maximum level, level ${user.level}!`,
            newStats: user.stats,
            newMaxHP: user.maxHP,
            level: user.level,
            newUserXP: 9999,
            newToLevelUpXP: 9999,
        })
    }
    
    res.json({
        message: `User leveled up to level ${user.level}!`,
        newStats: user.stats,
        newMaxHP: user.maxHP,
        level: user.level,
        newUserXP: user.xp,
        newToLevelUpXP: user.toLevelUpXP,
    })
}

function rollD20() 
{
    return Math.floor(Math.random() * 20) + 1;
}

function rollD10()
{
    return Math.floor(Math.random() * 10) + 1;
}

function getPrimaryStat(stats)
{ 
    let maxVal = -Infinity;
    let primary = "strength";

    for (const stat in stats) 
    {
        if (stat !== "defense" && stats[stat] > maxVal && stat !== "charisma") 
        {
            maxVal = stats[stat];
            primary = stat;
        }
    }

    return { name: primary, value: stats[primary]};
}

function rollAttack(attacker, defender) 
{
    attacker = attacker.toObject()
    defender = defender.toObject()

    const attackerStats = attacker.stats || attacker.currentStats;
    const defenderStats = defender.stats || defender.currentStats;

    const {name : primaryStatName, value: attackerStat} = getPrimaryStat(attackerStats);
    const defenderStat = defenderStats.defense;

    const d20 = rollD20();
    const d10 = rollD10();
    let isCrit = 0; 

    if (d20 === 20)
    {
        isCrit = 1;
    }

    const attackTotal = attackerStat + d20 + 2; //template modifier, need to edit
    const defenseTotal = defenderStat + d10;
    const hit = isCrit || attackTotal > defenseTotal;

    let damage = 0;
    let scale = 7;
    let base = 45;

    if (hit) 
    {
        const statDiff = attackerStat - defenderStat;
        const d20Bonus = (d20 - 6) * 0.005;

        damage = base * (1 + statDiff/scale) * (1 + d20Bonus);
        if (isCrit) 
            damage = damage * 2;
        damage = Math.max(10, Math.round(damage));
    }

    let attackerName = attacker.gamerTag || attacker.name
    let defenderName = defender.gamerTag || defender.name

    return {
        hit,
        crit: isCrit,
        d20,
        totalRollWithModifiers: attackerStat,
        totalRollNeeded: defenderStat,
        damage,
        primaryStat: primaryStatName,
        message: isCrit ? `Critical hit! ${attackerName} hit ${defenderName} for ${damage}!!!` : hit ? `${attackerName} hit ${defenderName} for ${damage}` : `${attackerName}'s attack missed completely!` 
    }
}

function rollTalk(attacker, defender)
{
  defender = JSON.parse(JSON.stringify(defender))
  attacker = JSON.parse(JSON.stringify(attacker))


  let defenderCharisma = defender.stats.charisma
  let attackerCharisma = attacker.currentStats.charisma 

  let attackerName = attacker.gamerTag
  let defenderName = defender.name

  const defenderStat = defenderCharisma;
  let isCrit = 0;
  let friendshipContribution;
  const d20 = rollD20();

  if (d20 === 20)
  {
    isCrit = 1;
  }

  let success = (((d20 + attackerCharisma) > defenderStat) || isCrit); //If d20 + Charisma stat > defender charisma or crit)

  //Charisma stat + roll > defender charisma
  
  if (success)
  {
    friendshipContribution = 20;
    if (isCrit)
      friendshipContribution = friendshipContribution * 2;
  }
  else friendshipContribution = 0;
  

  return {
    success: success,
    friendshipContribution : friendshipContribution,
    crit: isCrit,
    d20: d20,
    totalRollWithModifiers: d20 + attackerCharisma,
    totalRollNeeded: defenderCharisma,
    message : isCrit ? `${attackerName} critically charmed ${defenderName} for ${friendshipContribution}!!` : success ? `${attackerName} charmed ${defenderName} for ${friendshipContribution}!` : `${attacker.name}'s attempt to charm ${defender.name} did NOT work!!!!`
  }
}

function rollItemUse(user, item)
{
  const hasItem = user.CurrentLoot && user.CurrentLoot.some(i => i.itemId.name === item.itemId.name);

  if(!hasItem)
  {
    return {success: false, message: "Item not in user's inventory"};
  }
  
  if (!item.itemId.description || !item.itemId.healthAmount)
  {
    return {success: false, message: "item is not a healing item!"};
  }

  //Crit means double value of potion
  const d20 = rollD20();
  let consumed;
  let isCrit;
  let itemValue = item.itemId.healthAmount || 0;
  let hpGain = 0;

  if (d20 == 1)
  {
    consumed = 0;
    isCrit = 0;
    hpGain = itemValue;

    return {
      success: consumed === 1,
      crit: isCrit,
      consumed: consumed,
      d20: d20,
      hpGain: hpGain,
      message : `${user.gamerTag} fumbled getting the item from their bag! Bad luck! Still in user inventory`
    }
  }
  else if (d20 === 20)
  {
    consumed = 1;
    isCrit = 1;
    hpGain = itemValue * 2;

    return {
      success: consumed === 1,
      crit: isCrit,
      consumed,
      d20: d20,
      hpGain: hpGain,
      message: `${user.gamerTag} rolled a nat 20 and healed for double! Total restored: ${hpGain}`
    }
  }
  else if (d20 > 1 && d20 < 20)
  {
    consumed = 1;
    isCrit = 0;
    hpGain = itemValue;

    return {
      success: consumed === 1,
      crit: isCrit,
      consumed,
      hpGain: hpGain,
      d20: d20,
      message : `${user.gamerTag} healed for ${itemValue}`
    }
  }
}

function rollFlee(user, enemy)
{
  const d20 = rollD20();
  let rollNeeded;
  if (enemy.level === 10)
  {
    rollNeeded = 20;
  }
  else rollNeeded = 10 + (enemy.level - user.level);

  if (d20 >= rollNeeded){
    return{
      success: true,
      d20: d20,
      rollNeeded: rollNeeded,
      message: `${user.gamerTag} managed to escape!`
    }
  }
  else {
    return{
      success: false,
      d20: d20,
      RollNeeded: rollNeeded,
      message: `${user.gamerTag} could not find an escape!`
    }
  }
}

exports.startEncounter = async (req, res) => {
  const userId = req.user.userId;
  const { enemyType, enemyId } = req.body; // Pass enemyType and enemyId from frontend



  // Load user
  const user = await loadEntity(userId, 'User');
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Load enemy based on type
  let enemy;
  if (enemyType === 'boss') {
    enemy = await loadEntity(enemyId, 'boss');
  } else if (enemyType === 'common_enemy') {
    enemy = await loadEntity(enemyId, 'common_enemy');
  } else {
    return res.status(400).json({ error: 'Invalid enemy type' });
  }
  if (!enemy) return res.status(404).json({ error: 'Enemy not found' });

  const enemyObject = enemy.toObject();

  //Check for existing
  const existingEncounter = await Encounter.findOne({ userId, isActive: true });
  if (existingEncounter) {
    return res.json({
    message: 'Encounter already exists for this user',
    user: {
      stats: user.stats,
      maxHP: user.maxHP,
      currentHP: existingEncounter.userHP,
      level: user.level,
    },
    enemy: {
      stats: enemyObject.stats,
      relationshipGoal: enemyObject.relationshipGoal,
      maxHP: enemyObject.maxHP,
      currentHP: existingEncounter.enemyHP,
      name: enemyObject.name,
    },
    currentTurn: existingEncounter.currentTurn,
  });
  }

  // Create encounter
  const encounter = await Encounter.create({
    userId,
    enemyId: enemy._id,
    enemyType,
    userHP: user.maxHP,
    enemyHP: enemy.maxHP,
    currentTurn: 'User',
    enemyFriendliness: 0, // Initial friendliness for charm attempts
  });

  res.json({
    message: 'Encounter started!',
    user: {
      stats: user.stats,
      maxHP: user.maxHP,
      currentHP: encounter.userHP,
      level: user.level,
    },
    enemy: {
      stats: enemyObject.stats,
      relationshipGoal: enemyObject.relationshipGoal,
      maxHP: enemyObject.maxHP,
      currentHP: enemyObject.maxHP,
      name: enemyObject.name,
    },
    currentTurn: 'User',
  });
};

async function userAttackLogic(encounter, user, enemy) 
{
  const userAttack = rollAttack(user, enemy); //Also need to split path for different user options.
  encounter.enemyHP = Math.max(0, encounter.enemyHP - userAttack.damage);
  let result;

  if (encounter.enemyHP <= 0) 
  {
    encounter.isActive = false;
    encounter.currentTurn = null;
    await encounter.save();

    const rewards = await handleEnemyDefeat(user._id, encounter.enemyId, encounter.enemyType);

    result = {
      message : 'Enemy defeated!',
      userAttack, 
      postTurnUserHP: encounter.userHP,
      postTurnEnemyHP: 0,
      currentTurn: null,
      rewards
    };
  }
  else if (encounter.enemyHP > 0) 
  {
    await encounter.save();
    result = {
      message: 'User attack complete',
      userAttack,
      postTurnUserHP: encounter.userHP,
      postTurnEnemyHP: encounter.enemyHP,
      currentTurn: 'Enemy',
    };
  }

  return result;
}

// BROUGHT FROM OTHER FILE SOMEHOW NOT FINDING IT EVEN WITH YOUR EXPORT
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
    
    let CurrentLoot = user.CurrentLoot
    if (!itemId) throw new Error('Item does not exist!');
    const existingItem = CurrentLoot.findIndex(loot => loot.itemId && loot.itemId.toString() === itemId.toString());

    if (existingItem > -1) {
        user.CurrentLoot[existingItem].quantity += quantity;    
    } else {
        user.CurrentLoot.push({ itemId, quantity });
    }
}

async function handleEnemyDefeat(userId, enemyId, enemyType) {
    const user = await loadEntity(userId, 'User');
    const enemy = await loadEntity(enemyId, enemyType);
    let enemyObj = enemy.toObject()
    let levelupTrigger = false;

    if (!user || !enemy) 
    {
        throw new Error('User or Boss not found');
    }
    user.Currency = user.Currency + (enemyObj.reward.gold || 0);
    user.currentXP = user.currentXP + (enemyObj.reward.xp || 0);

    if (user.currentXP >= user.toLevelUpXP)
    {
      levelupTrigger = true;
    }

    let rewards = 
    {
        gold: enemyObj.reward.gold || 0,
        items: [],
        xp: enemyObj.reward.xp || 0,
        readyToLevelUp: levelupTrigger
    };
    
    // Add XP TO DB
    if(rewards.readyToLevelUp && user.level < 10){
      user.level+=1;
      user.toLevelUpXP = Math.ceil(user.toLevelUpXP * 1.6);
    }

    let expSave = await user.save()
    console.log(expSave)

    if (user.Bosses.includes(enemy._id.toString())) 
    {
        await user.save();
        return {rewards};
    }

    console.log(enemy.reward)
    for (const reward of enemy.reward.items || [])
    {
        if (reward.itemId)
        {
            try {
                console.log("HERE2")
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
    user.Bosses.push(enemy._id);

    const nextBoss = await setNextBossForUser(user);
    user.currentActiveBoss = nextBoss ? nextBoss._id : null;


    const newStats = applyStatGrowth(user.Character.class, user.stats, user.level);
    user.stats.strength = newStats.strength;
    user.stats.dexterity = newStats.dexterity;
    user.stats.intelligence = newStats.intelligence;
    user.stats.charisma = newStats.charisma;
    user.maxHP = newStats.maxHP;
    user.currentHP = newStats.maxHP; // currentHP exists in the database, should be removed but fine for now
    
    
    await user.save();
    return rewards;
}


async function userTalkLogic(encounter, user, enemy)
{
  const userTalk = rollTalk(user, enemy);
  enemy = enemy.toObject()
  user = user.toObject()

  encounter.enemyFriendliness = Math.min(encounter.enemyFriendliness + userTalk.friendshipContribution, enemy.relationshipGoal);
  if (encounter.enemyFriendliness >= enemy.relationshipGoal)
  {
    encounter.isActive = false;
    encounter.currentTurn = null;
    await encounter.save();

    return {
      message: 'Enemy charmed successfully!',
      userTalk,
      postTurnUserHP: encounter.userHP,
      postTurnEnemyHP: encounter.enemyHP,
      postTurnFriendship: encounter.enemyFriendliness,
      currentTurn: null,
      rewards: await handleEnemyDefeat(user._id, encounter.enemyId, encounter.enemyType)
    };
  }
  
  else if (encounter.enemyFriendliness < enemy.relationshipGoal && encounter.enemyFriendliness >= 0)
  {
    await encounter.save();
    return {
      message: 'User attempted to charm enemy',
      userTalk,
      postTurnUserHP: encounter.userHP,
      postTurnEnemyHP: encounter.enemyHP,
      postTurnFriendship: encounter.enemyFriendliness,
      currentTurn: 'Enemy'
    };
  }
}

async function userItemLogic(encounter, user, item)
{
  const itemResult = rollItemUse(user, item);

  if (!itemResult.success && !itemResult.consumed)
  {
    return {
      message: itemResult.message,
      success: false,
      itemToBeRemoved: null,
      d20: itemResult.d20,
      crit: itemResult.crit,
      consumed: itemResult.consumed,
      hpGain: itemResult.hpGain
    };
  }

  if (itemResult.consumed) 
  {
    user.CurrentLoot = user.CurrentLoot.filter(i => i.itemId.name !== item.itemId.name);
    await user.save();
  }

  encounter.userHP = Math.min(encounter.userHP + itemResult.hpGain, user.maxHP);
  await encounter.save();

  return {
    message: itemResult.message,
    success: true,
    itemToBeRemoved: item.itemId.name,
    d20: itemResult.d20,
    crit: itemResult.crit,
    consumed: itemResult.consumed,
    hpGain: itemResult.hpGain,
    postTurnUserHP: encounter.userHP,
    postTurnEnemyHP: encounter.enemyHP,
    currentTurn: 'Enemy'
  };
}

async function userFleeLogic(encounter, user, enemy)
{
  const fleeResult = rollFlee(user, enemy);

  if (fleeResult.success) 
  {
    encounter.isActive = false;
    encounter.currentTurn = null;
    await encounter.save();

    return {
      message: fleeResult.message,
      success: true,
      d20: fleeResult.d20,
      rollNeeded: fleeResult.rollNeeded,
      currentTurn: null
    };
  } 
  else 
  {
    await encounter.save();
    return {
      message: fleeResult.message,
      success: false,
      d20: fleeResult.d20,
      totalRollNeeded: fleeResult.totalRollNeeded,
      currentTurn: 'Enemy'
    };
  }
}

async function enemyAttackLogic(encounter, user, enemy)
{
  const enemyAttack = rollAttack (enemy, user);
  encounter.userHP = Math.max(0, encounter.userHP - enemyAttack.damage);
  let result; 

  if (encounter.userHP <= 0)
    {
    encounter.isActive = false;
    encounter.currentTurn = null;
    user.currency = Math.max(0, user.currency - 10); //Example penalty for defeat
    
    await user.save();
    await encounter.save();
    result = 
      {
      message: `User was defeated, losing 10 gold`,
      enemyAttack,
      postTurnUserHP: 0,
      postTurnEnemyHP: encounter.enemyHP,
      currentTurn: null,
      rewards: null
      }
    }
  else if (encounter.userHP > 0)
  {
    user.currentHP = encounter.userHP; //Actually update db!
    await user.save();

    await encounter.save();
    // ADD CODE HERE FOR USER CURRENTHP 
    result = {
      message: 'Enemy attack complete',
      enemyAttack,
      postTurnUserHP: encounter.userHP,
      postTurnEnemyHP: encounter.enemyHP,
      currentTurn: 'User'
    };
  }

  return result;
}

exports.userTurnAndEnemyResponse = async(req, res) => {
  const userId = req.user.userId;
  const {action, item} = req.body;
  let userResult;
  let enemyResult;
  let foundItem = null;
  const encounter = await Encounter.findOne({userId, isActive: true});
  if (!encounter || encounter.currentTurn !== 'User')
    return res.status(400).json({error: 'Not the user turn or no active encounter'});

  const user = await loadEntity(encounter.userId, 'User');
  const enemy = await loadEntity(encounter.enemyId, encounter.enemyType);

  if (item && item.name) 
  {
    foundItem = user.CurrentLoot.find(loot => loot.itemId.name === item.name);
  }

  if (action === 'attack') 
  {
    userResult = await userAttackLogic(encounter, user, enemy);
    if (userResult.message.includes('defeated'))
    {
      return res.json(userResult);
    }
  }
  else if (action === 'item')
  {
    userResult = await userItemLogic(encounter, user, foundItem);
  }
  else if (action === 'talk')
  {
    userResult = await userTalkLogic(encounter, user, enemy);
    if (userResult.message.includes('charmed successfully'))
    {
      return res.json(userResult);
    }
  }
  else if (action === 'flee')
  {
    userResult = await userFleeLogic(encounter, user, enemy);
    if (userResult.success)
    {
      return res.json(userResult);
    }
  }
  
  // After user turn, switch to enemy turn
  encounter.currentTurn = 'Enemy';

  enemyResult = await enemyAttackLogic(encounter, user, enemy);

  if (!enemyResult) 
  {
    return res.status(500).json({error: 'Error processing enemy attack'});
  }
  else if ( enemyResult.message.includes('defeated')) 
  {
    //Enemy killed user RESET HP
    user.currentHP = user.maxHP;
    await user.save()

    return res.json({userResult, enemyResult});
  }

  encounter.expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes from now
  encounter.currentTurn = 'User';
  await encounter.save();
  let newToken = createToken(userId)
  res.json({
    message: 'Turn complete',
    userResult,
    enemyResult,
    token:newToken
  });

}

exports.getActiveEncounter =  async (req, res) => {
  const userId = req.user.userId;
  const encounter = await Encounter.findOne({userId, isActive: true});
  if (!encounter) {
    return res.status(404).json({ error: 'No active encounter found' });
  }
  res.json({inFight: true, encounter});
}

// module.exports = {
//   levelupUser,
//   startEncounter,
//   userTurnAndEnemyResponse,
//   loadEntity,
//   getActiveEncounter
// };