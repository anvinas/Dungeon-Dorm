const classGrowthRules = {
  Barbarian: (stats, level) => {
    const updatedStats = { 
      Strength: stats.Strength + 1,                        // +1 every level
      Dexterity: stats.Dexterity + (level % 3 === 0 ? 1 : 0), // +1 every 3rd level
      Intelligence: stats.Intelligence,                   // No increase
      Charisma: stats.Charisma + (level % 3 === 0 ? 1 : 0),   // +1 every 3rd level
      Defense: stats.Defense + 1,                          // +1 every level
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
      Strength: stats.Strength + (level % 3 === 0 ? 1 : 0),    // +1 every 3rd level
      Dexterity: stats.Dexterity + (level % 2 === 0 ? 1 : 0),  // +1 every 2nd level
      Intelligence: stats.Intelligence + (level % 2 === 0 ? 1 : 0), // +1 every 2nd level
      Charisma: stats.Charisma + 1,                            // +1 every level
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
        message: isCrit ? `Critical hit! ${attacker.name} dealt ${damage}!!!` : hit ? `${attacker.name} hit for ${damage}` : `${attacker.name}'s attack missed completely!` 
    }
}

exports.rollFight = async (req, res) => 
{
  try 
  {
    const {attackerId, defenderI}
  }

}

exports.rollTalk = async (req, res) =>
{


}

exports.rollItem = async (req, res) =>
{


}

exports.rollRun = async (req, res) =>
{



}



module.exports = {applyStatGrowth,};
