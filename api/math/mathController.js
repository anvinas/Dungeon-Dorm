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
        damage,
        primaryStat: primaryStatName,
        message: isCrit ? `Critical hit! ${attacker.name} hit ${defender.name} for ${damage}!!!` : hit ? `${attacker.name} hit ${defender.name} for ${damage}` : `${attacker.name}'s attack missed completely!` 
    }
}

exports.startEncounter = async (req, res) => {
  const userId = req.user.userId;

  const enemy = await Enemy.findOne({ type : 'Goblin'}); // Placeholder, needs to pull right enemy

  const encounter = await Encounter.create({
    userId,
    enemyId: enemy._id,
    enemyType: 'Common', //Placeholder
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

    const rewards = await handleBossDefeat(userId, encounter.enemyId);

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

async function enemyAttackLogic(encounter, user, enemy)
{
  const enemyAttack = rollAttack (enemy, user);
  encounter.userHP = Math.max(0, encounter.userHP - enemyAttack.damage);
  let result; 

  if (encounter.userHP <= 0)
    {
    encounter.isActive = false;
    encounter.currentTurn = null;
    await encounter.save();
    result = 
      {
      message: 'User was defeated',
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
    // Handle item usage logic here
    // For now, just return a placeholder response
    return res.status(400).json({error: 'Item usage not implemented yet'});
  }
  else if (action === 'defend')
  {
    // Handle defend logic here
    // For now, just return a placeholder response
    return res.status(400).json({error: 'Defend action not implemented yet'});
  }
  else if (action === 'flee')
  {
    // Handle flee logic here
    // For now, just return a placeholder response
    return res.status(400).json({error: 'Flee action not implemented yet'});
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


  encounter.currentTurn = 'User';
  await encounter.save();

  res.json({
    message: 'Turn complete',
    userResult,
    enemyResult,
  });

}
module.exports = {applyStatGrowth, startEncounter, userTurn};
