const User = require('../auth/authModel');
const Boss = require('../global/Boss');
const CommonEnemy = require('../global/CommonEnemy');
const { handleEnemyDefeat } = require('./combatResolution');
const Encounter = require('./Encounter');

async function loadEntity(id, type) {
  if (!id || !type) throw new Error('Missing id or type for loadEntity');

  switch (type) {
    case 'User':
      return await UserProfile.findById(id);
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
      Strength: stats.Strength + 1,                           // +1 every level
      Dexterity: stats.Dexterity + (level % 3 === 0 ? 1 : 0), // +1 every 3rd level
      Intelligence: stats.Intelligence,                       // No increase
      Charisma: stats.Charisma + (level % 3 === 0 ? 1 : 0),   // +1 every 3rd level
      Defense: stats.Defense + 1,                             // +1 every level
    };

    const maxHP =
      100 +
      12 * updatedStats.Defense +
      7 * updatedStats.Strength +
      6 * updatedStats.Dexterity +
      8 * updatedStats.Intelligence;

    return {
      ...updatedStats,
      maxHP
    };
  },

  Rogue: (stats, level) => {
    const updatedStats = { 
      Strength: stats.Strength + (level % 3 === 0 ? 1 : 0),    // +1 every 3rd level
      Dexterity: stats.Dexterity + 1,                          // +1 every level
      Intelligence: stats.Intelligence,                        // No increase
      Charisma: stats.Charisma + (level % 2 === 0 ? 1 : 0),    // +1 every 2nd level
      Defense: stats.Defense + 1,                              // +1 every level
    };

    const maxHP =
      100 +
      12 * updatedStats.Defense +
      7 * updatedStats.Strength +
      6 * updatedStats.Dexterity +
      8 * updatedStats.Intelligence;

    return {
      ...updatedStats,
      maxHP
    };
  },

  Bard: (stats, level) => {
    const updatedStats = { 
      Strength: stats.Strength + (level % 3 === 0 ? 1 : 0),         // +1 every 3rd level
      Dexterity: stats.Dexterity + (level % 2 === 0 ? 1 : 0),       // +1 every 2nd level
      Intelligence: stats.Intelligence + (level % 2 === 0 ? 1 : 0), // +1 every 2nd level
      Charisma: stats.Charisma + 1,                                 // +1 every level
      Defense: stats.Defense + (level % 3 === 0 ? 1 : 0),           // +1 every 3rd level
    };

    const maxHP =
      100 +
      12 * updatedStats.Defense +
      7 * updatedStats.Strength +
      6 * updatedStats.Dexterity +
      8 * updatedStats.Intelligence;

    return {
      ...updatedStats,
      maxHP
    };
  },

  Warlock: (stats, level) => {
    const updatedStats = { 
      Strength: stats.Strength,                                // No increase
      Dexterity: stats.Dexterity + (level % 2 === 0 ? 1 : 0),  // +1 every 2nd level
      Intelligence: stats.Intelligence + 1,                    // +1 every level
      Charisma: stats.Charisma + (level % 4 === 0 ? 1 : 0),    // +1 every 4th level
      Defense: stats.Defense + (level % 3 === 0 ? 1 : 0),      // +1 every 3rd level
    };

    const maxHP =
      100 +
      12 * updatedStats.Defense +
      7 * updatedStats.Strength +
      6 * updatedStats.Dexterity +
      8 * updatedStats.Intelligence;

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
    const user = await loadEntity(userId, 'User');

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    user.xp = user.xp - user.toLevelUpXP;
    user.level = user.level + 1;

    const newStats = applyStatGrowth(user.class, user.stats, user.level);

    user.stats.Strength = newStats.Strength;
    user.stats.Dexterity = newStats.Dexterity;
    user.stats.Intelligence = newStats.Intelligence;
    user.stats.Charisma = newStats.Charisma;
    user.maxHP = newStats.maxHP;
    user.currentHP = newStats.maxHP; //currentHP exists in the databse, should be removed but fine for now
    user.toLevelUpXP = 1000 + (150 * user.level); //example formula, can be changed

    await user.save();
    
    res.json({
        message: `User leveled up to level ${user.level}!`,
        newStats: user.stats,
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
    let primary = "Strength";

    for (const stat in stats) 
    {
        if (stat !== "Defense" && stats[stat] > maxVal) 
        {
            maxVal = stats[stat];
            primary = stat;
        }
    }

    return { name: primary, value: stats[primary]};
}

function rollAttack(attacker, defender) 
{
    const {name : primaryStatName, value: attackerStat} = getPrimaryStat(attacker.stats);
    const defenderStat = defender.stats.Defense;

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

    return {
        hit,
        crit: isCrit,
        d20,
        totalRollWithModifiers: attackerStat,
        totalRollNeeded: defenderStat,
        damage,
        primaryStat: primaryStatName,
        message: isCrit ? `Critical hit! ${attacker.name} hit ${defender.name} for ${damage}!!!` : hit ? `${attacker.name} hit ${defender.name} for ${damage}` : `${attacker.name}'s attack missed completely!` 
    }
}

function rollTalk(attacker, defender)
{
  const defenderStat = defender.stats.Charisma;
  let isCrit = 0;
  let friendshipContribution;
  const d20 = rollD20();

  if (d20 === 20)
  {
    isCrit = 1;
  }

  let success = ((d20 + attacker.stats.Charisma) > defenderStat)

  //Charisma stat + roll > defender charisma
  
  if (isCrit || success)
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
    totalRollWithModifiers: d20 + attacker.stats.Charisma,
    totalRollNeeded: defender.stats.Charisma,
    message : isCrit ? `${attacker.name} critically charmed ${defender.name} for ${friendshipContribution}!!` : success ? `${attacker.name} charmed ${defender.name} for ${friendshipContribution}!` : `${attacker.name}'s attempt to charm ${defedner.name} did NOT work!!!!`
  }
}

function rollItemUse(user, item)
{
  const hasItem = user.CurrentLoot && user.CurrentLoot.some(i => i.name === item.name);

  if(!hasItem)
  {
    return {success: false, message: "Item not in user's inventory"};
  }
  
  if (!item.description || !item.healthAmount)
  {
    return {success: false, message: "item is not a potion!"};
  }

  //Crit means double value of potion
  const d20 = rollD20();
  let consumed;
  let isCrit;
  let itemValue = item.healthAmount || 0;
  let hpGain = 0;

  if (d20 == 0)
  {
    consumed = 0;
    isCrit = 0;
    hpGain = itemValue;

    return {
      success: consumed === 1,
      crit: isCrit,
      consumed,
      d20: d20,
      hpGain: hpGain,
      message : `${user.name} fumbled getting the potion from their bag! Bad luck!`
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
      message: `${user.name} rolled a nat 20 and healed for double! Total restored: ${hpGain}`
    }
  }
  else if (d20 > 0 && d20 < 20)
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
      message : `${user.name} healed for ${itemValue}`
    }
  }
}

function rollFlee(user, enemy)
{
  const d20 = rollD20();
  
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
      message: `${user.name} managed to escape!`
    }
  }
  else {
    return{
      success: false,
      d20: d20,
      totalRollNeeded: rollNeeded,
      message: `${user.name} could not find an escape!`
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
  if (enemyType === 'Boss') {
    enemy = await loadEntity(enemyId, 'boss');
  } else if (enemyType === 'CommonEnemy') {
    enemy = await loadEntity(enemyId, 'common_enemy');
  } else {
    return res.status(400).json({ error: 'Invalid enemy type' });
  }
  if (!enemy) return res.status(404).json({ error: 'Enemy not found' });

  // Create encounter
  const encounter = await Encounter.create({
    userId,
    enemyId: enemy._id,
    enemyType,
    userHP: user.stats.maxHP,
    enemyHP: enemy.stats.HP,
    currentTurn: 'User'
  });

  res.json({
    message: 'Encounter started!',
    userStats: user.stats,
    enemyStats: enemy.stats,
    currentTurn: 'User'
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

    const rewards = await handleEnemyDefeat(userId, encounter.enemyId, encounter.enemyType);

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

async function userTalkLogic(encounter, user, enemy)
{
  const userTalk = rollTalk(user, enemy);
  encounter.friendship = Math.min(100, encounter.friendship + userTalk.friendshipContribution);

  if (encounter.friendship >= 100)
  {
    encounter.isActive = false;
    encounter.currentTurn = null;
    await encounter.save();

    return {
      message: 'Enemy charmed successfully!',
      userTalk,
      postTurnUserHP: encounter.userHP,
      postTurnEnemyHP: encounter.enemyHP,
      postTurnFriendship: encounter.friendship,
      currentTurn: null,
      rewards: await handleEnemyDefeat(userId, encounter.enemyId, encounter.enemyType)
    };
  }
  
  else if (encounter.friendship < 100 && encounter.friendship >= 0)
  {
    await encounter.save();
    return {
      message: 'User attempted to charm enemy',
      userTalk,
      postTurnUserHP: encounter.userHP,
      postTurnEnemyHP: encounter.enemyHP,
      postTurnFriendship: encounter.friendship,
      currentTurn: 'Enemy'
    };
  }
}

async function userItemLogic(encounter, user, item)
{
  const itemResult = rollItemUse(user, item);

  if (!itemResult.success)
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
    user.CurrentLoot = user.CurrentLoot.filter(i => i.name !== item.name);
    await user.save();
  }

  encounter.userHP = Math.min(encounter.userHP + itemResult.hpGain, user.stats.maxHP);
  await encounter.save();

  return {
    message: itemResult.message,
    success: true,
    itemToBeRemoved: item.name,
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
    await encounter.save(); 
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
  const encounter = await Encounter.findOne({userId, isActive: true});

  if (!encounter || encounter.currentTurn !== 'User')
    return res.status(400).json({error: 'Not the user turn or no active encounter'});

  const user = await loadEntity(encounter.userID, 'User');
  const enemy = await loadEntity(encounter.enemyId, encounter.enemyType);

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
    userResult = await userItemLogic(encounter, user, item);
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
    //Handle enemy defeat logic here
    return res.json(userResult, enemyResult);
  }

  encounter.expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes from now
  encounter.currentTurn = 'User';
  await encounter.save();

  res.json({
    message: 'Turn complete',
    userResult,
    enemyResult,
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

module.exports = {
  levelupUser,
  startEncounter,
  userTurnAndEnemyResponse,
  loadEntity,
  getActiveEncounter
};