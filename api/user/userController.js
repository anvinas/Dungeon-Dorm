// api/user/userController.js
const UserProfile = require('../auth/authModel'); // UserProfile model is in api/auth/
const CharacterClass = require('../../models/CharacterClass'); // CharacterClass model is now in top-level models/
const InventoryItem = require('../barkeeper/InventoryItem'); // InventoryItem model is in api/barkeeper/
const Boss = require('../global/Boss');
const CommonEnemy = require('../global/CommonEnemy');
const {setNextBossForUser} = require('../fight/combatResolution'); // Import the function to set next boss

// Helper function to add items to user's inventory (re-usable)
const addItemToUserInventory = (user, itemId, quantity) => {
    // This check for loot.itemId handles cases where existing items might be malformed in DB.
    const existingItemIndex = user.CurrentLoot.findIndex(loot => loot.itemId && loot.itemId.toString() === itemId.toString());

    if (existingItemIndex > -1) {
        user.CurrentLoot[existingItemIndex].quantity += quantity;
    } else {
        user.CurrentLoot.push({ itemId, quantity });
    }
};

// @desc    Select a character class for the user
// @route   POST /api/user/select-character
// @access  Private (requires token)
const selectCharacter = async (req, res) => {
    const { characterClassId } = req.body;
    const userId = req.user.userId;

    if (!characterClassId) {
        return res.status(400).json({ error: 'Character Class ID is required.' });
    }

    try {
        const user = await UserProfile.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        // --- ENFORCE ONE-TIME SELECTION ---
        if (user.Character) {
            // Populate the existing character to show what they already picked
            await user.populate('Character'); // Populate here to get species/class for error message
            return res.status(400).json({
                error: `Character class has already been selected (${user.Character.species} ${user.Character.class}) and cannot be changed.`,
                currentClass: user.Character.species
            });
        }
        // --- END ONE-TIME SELECTION ---

        // Populate the 'weapon' field of the CharacterClass to get the full InventoryItem object
        const characterClass = await CharacterClass.findById(characterClassId).populate('weapon');

        if (!characterClass) {
            return res.status(404).json({ error: 'Character Class not found.' });
        }

        // Apply class attributes to user profile
        user.Character = characterClass._id; // Store the ID of the chosen CharacterClass
        user.Currency += characterClass.gold; // Add initial gold
        user.currentStats = { ...characterClass.stats }; // Copy initial stats
        user.maxHP = characterClass.maxHP; // Initialize maxHP from class
        user.currentHP = characterClass.maxHP; // Initialize currentHP to maxHP (full health)

        // Add the starting weapon to user's inventory
        if (characterClass.weapon) { // Check if weapon was successfully populated
            addItemToUserInventory(user, characterClass.weapon._id, 1);
        } else {
            console.warn(`Warning: Starting weapon for CharacterClass ID ${characterClass._id} was not found or populated correctly. User will not receive initial weapon.`);
            // You might want to return an error or handle this more gracefully in a real game
        }

        await user.save();

        res.json({
            message: `You have successfully selected ${characterClass.species} (${characterClass.class}) as your character!`,
            userProfile: {
                gamerTag: user.gamerTag,
                level: user.level,
                currency: user.Currency,
                character: characterClass.species,
                class: characterClass.class,
                currentStats: user.currentStats,
                maxHP: user.maxHP,
                currentHP: user.currentHP,
                currentLoot: user.CurrentLoot // Should now include the weapon
            }
        });

    } catch (err) {
        console.error('Error selecting character class:', err);
        res.status(500).json({ error: 'Server error during character selection.' });
    }
};

// --- NEW FUNCTION: setCurrentBoss ---
// @desc    Sets the ID of the boss the user is currently on/facing
// @route   POST /api/user/set-current-boss
// @access  Private (requires token)
const setCurrentBoss = async (req, res) => {
    const { bossId } = req.body;
    const userId = req.user.userId;

    if (!bossId) {
        return res.status(400).json({ error: 'Boss ID is required.' });
    }

    try {
        const user = await UserProfile.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        // Validate that the boss exists
        const boss = await Boss.findById(bossId);
        if (!boss) {
            return res.status(404).json({ error: 'Boss not found.' });
        }

        user.currentActiveBoss = boss._id; // Set the current active boss ID
        await user.save();

        res.json({
            message: `Current active boss set to: ${boss.name} (Level ${boss.level || 'N/A'})`,
            userProfile: {
                gamerTag: user.gamerTag,
                currentActiveBoss: {
                    id: boss._id,
                    name: boss.name,
                    level: boss.level,
                    description: boss.description // Include more boss details if needed
                }
            }
        });

    } catch (err) {
        console.error('Error setting current boss:', err);
        res.status(500).json({ error: 'Server error setting current boss.' });
    }
};

// --- NEW FUNCTION: defeatBoss ---
// @desc    Update user profile after defeating a boss and progress to next
// @route   POST /api/user/defeat-boss
// @access  Private (requires token)
const defeatBoss = async (req, res) => {
    const { bossId } = req.body; // The ID of the boss that was JUST DEFEATED
    const userId = req.user.userId;

    if (!bossId) {
        return res.status(400).json({ error: 'Boss ID is required.' });
    }

    try {
        const user = await UserProfile.findById(userId);
        const defeatedBoss = await Boss.findById(bossId).populate('reward.items.itemId'); // Populate reward items

        if (!user) {
            return res.status(404).json({ error: 'User profile not found.' });
        }
        if (!defeatedBoss) {
            return res.status(404).json({ error: 'Defeated Boss not found in database.' });
        }

        // Check if this boss is already in the user's defeated list
        if (user.Bosses.includes(defeatedBoss._id.toString())) {
             return res.status(400).json({ error: `Boss '${defeatedBoss.name}' (Level ${defeatedBoss.level || 'N/A'}) already defeated by this user.` });
        }

        // Apply rewards
        user.Currency += defeatedBoss.reward.gold; // Use 'gold' as per your Boss schema
        if (defeatedBoss.reward.items && defeatedBoss.reward.items.length > 0) { // Ensure items array exists and has items
            defeatedBoss.reward.items.forEach(rewardItem => {
                // Ensure rewardItem.itemId is not null/undefined from populate
                if (rewardItem.itemId) {
                    addItemToUserInventory(user, rewardItem.itemId._id, rewardItem.quantity);
                } else {
                    console.warn(`Warning: Reward item for boss ${defeatedBoss.name} (ID: ${defeatedBoss._id}) was not found or populated correctly. Item not added.`);
                }
            });
        }
        user.Bosses.push(defeatedBoss._id); // Add boss to defeated list

        // --- Determine the Next Boss ---
        // 1. Get all bosses sorted by level
        const allBosses = await Boss.find({}).sort({ level: 1 });

        // 2. Filter out bosses the user has already defeated
        const defeatedBossIds = user.Bosses.map(bossId => bossId.toString()); // Convert ObjectIds to strings for comparison
        const undefeatedBosses = allBosses.filter(boss => !defeatedBossIds.includes(boss._id.toString()));

        let nextBoss = null;
        if (undefeatedBosses.length > 0) {
            // The next boss is the lowest level undefeated boss
            nextBoss = undefeatedBosses[0];
        }

        // Update user's currentActiveBoss tracker
        user.currentActiveBoss = nextBoss ? nextBoss._id : null; // Set to next boss's ID or null if all defeated

        await user.save(); // Save all changes

        res.json({
            message: `You have successfully defeated ${defeatedBoss.name} (Level ${defeatedBoss.level || 'N/A'})!`,
            rewardsGained: {
                gold: defeatedBoss.reward.gold,
                items: defeatedBoss.reward.items.map(item => ({ itemId: item.itemId._id, name: item.itemId.name, quantity: item.quantity }))
            },
            userProfileUpdates: {
                level: user.level,
                currency: user.Currency,
                currentLoot: user.CurrentLoot,
                defeatedBossesCount: user.Bosses.length,
                currentActiveBoss: nextBoss ? { id: nextBoss._id, name: nextBoss.name, level: nextBoss.level } : null,
                nextBossMessage: nextBoss ? `Your next challenge: ${nextBoss.name} (Level ${nextBoss.level || 'N/A'})` : "Congratulations! You have defeated all known bosses."
            }
        });

    } catch (err) {
        console.error('Error defeating boss:', err);
        res.status(500).json({ error: 'Server error during boss defeat update.' });
    }
};

const returnEnemies = async (req, res) => {
    try {
        const Bosses = await Boss.find({}).sort({level : 1});
        const Enemies = await CommonEnemy.find({}).sort({level : 1});
        res.json(Bosses, Enemies);
    }
    catch (err) {
        console.error('Error fetching Enemies from database:', err);
        res.status(500).json({error: 'Server error fetching Enemies.'});
    }
}

const fetchEnemyById = async (req, res) => {
    const {id} = req.params;
    try {
        const boss = await Boss.findById(id);
        const enemy = await CommonEnemy.findById(id);
        if (boss) {
            res.json(boss);
        }
        else if (enemy) {
            res.json(enemy);
        }
        else {
            res.status(404).json({error: 'Enemy not found.'});
        }
    }
    catch (err) {
        console.error('Error fetching Enemy via their ID:', err);
        res.status(500).json({ error: 'Server error fetching Enemy by ID.' });
    }
}

const fetchUserProfile = async (req, res) => {
    const userId = req.user.userId;
    
    try {
        const user = await UserProfile.findById(userId).select('-passwordHash -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires -email -activityState -currentHP -createdAt -updatedAt');
        if (!user) {
            return res.status(404).json({ error: 'User profile not found/Json Header incorrect' });
        }
        return res.json({user})
    }
    catch (err) {
        console.error('Error fetching user profile:', err);
        return res.status(500).json({ error: 'Server error fetching user profile.' });
    }
};

// @access  Private (requires token)
const purchaseItem = async (req, res) => {
    const { itemId, quantity ,price } = req.body; // ID of the item to purchase, and quantity
    const userId = req.user.userId; // Extracted from JWT by verifyToken middleware
    
    if (!itemId || !quantity || quantity <= 0 || !price) {
        return res.status(400).json({ error: 'Item ID , valid quantity and price are required.' });
    }

    try {
        const user = await UserProfile.findById(userId).select('-passwordHash -isEmailVerified -__v')
            .populate('Character')
        ; 

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const itemInShop = await InventoryItem.findById(itemId)

        if (!itemInShop) {
            return res.status(404).json({ error: 'Item not found in shop inventory.' });
        }


        if (user.Currency < price) {
            return res.status(400).json({ error: 'Not enough currency.' });
        }

        user.Currency -= price;

        // Inventory logic: Find if item already exists in user's CurrentLoot
        const existingUserItemIndex = user.CurrentLoot.findIndex(loot => loot.itemId.toString() === itemId);
        
        await user.populate('CurrentLoot.itemId');

        if (existingUserItemIndex > -1) {
            // If item exists, update its quantity
            user.CurrentLoot[existingUserItemIndex].quantity += quantity;
        } else {
            // If item is new, push a new object with itemId and quantity
            user.CurrentLoot.push({ itemId: itemId, quantity: quantity });
        }
        await user.save();

        res.json({
            message: 'Purchase successful!',
            user: user,
            purchasedItem: {
                itemId: itemInShop._id,
                name: itemInShop.name,
                quantity: quantity
            }
        });

    } catch (err) {
        console.error('Error purchasing item:', err);
        res.status(500).json({ error: 'Server error during purchase.' });
    }
};


const usePotionItem = async (req, res) => {
  const { itemId } = req.body;
  const userId = req.user.userId;

  if (!itemId) {
    return res.status(400).json({ error: 'Item ID is required.' });
  }

  try {
    const user = await UserProfile.findById(userId)
      .select('-passwordHash -isEmailVerified -__v')
      .populate('CurrentLoot.itemId'); // This loads the actual item details

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userItemIndex = user.CurrentLoot.findIndex(
      loot => loot.itemId._id.toString() === itemId
    );

    if (userItemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in user inventory.' });
    }

    const userItem = user.CurrentLoot[userItemIndex];
    let itemObject = userItem.itemId;
    itemObject = itemObject.toObject()
  
    // Validate it's a Potion
    if (itemObject.itemType !== 'Potion') {
      return res.status(400).json({ error: 'This item is not a potion.' });
    }

    if (userItem.quantity < 1) {
      return res.status(400).json({ error: 'Not enough quantity to use this item.' });
    }

    // Validate user HP data
    if (typeof user.currentHP !== 'number' || typeof user.maxHP !== 'number') {
      return res.status(500).json({ error: 'User HP data is invalid.' });
    }

    // Heal the user, but do not exceed maxHP
    const healAmount = itemObject.healthAmount || 0;
    const newHP = Math.min(user.currentHP + healAmount, user.maxHP);
    const actualHealed = newHP - user.currentHP;
    user.currentHP = newHP;

    // Subtract 1 from quantity
    userItem.quantity -= 1;

    // Remove the item from inventory if quantity is 0
    if (userItem.quantity <= 0) {
      user.CurrentLoot.splice(userItemIndex, 1);
    }

    await user.save();

    res.json({
      message: `Used potion and healed for ${actualHealed} HP.`,
      user:user
    });
  } catch (err) {
    console.error('Error using potion:', err);
    res.status(500).json({ error: 'Server error while using potion.' });
  }
};

const deleteUserProgress = async (req, res) => {
    const userId = req.user.userId;
    let currentBoss;
    
    try{
        const user = await UserProfile.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Reset user progress
        user.level = 1;
        user.Bosses = [];
        user.Currency = 0;
        user.CurrentLoot = [];
        user.Character = null
        user.currentStats.strength = 0;
        user.currentStats.dexterity = 0;
        user.currentStats.intelligence = 0;
        user.currentStats.charisma = 0;
        user.currentStats.defense = 0;
        user.maxHP = 100;
        user.CurrentHP = 100;
        user.currentXP = 0;
        user.toLevelUpXP = 1000
        currentBoss = setNextBossForUser(user);

        //console.log(`User progress reset for user ID: ${userId}`);
        return res.json({
            message: 'User progress has been reset successfully.',
            userProfile: {
                gamerTag: user.gamerTag,
                level: user.level,
                currency: user.Currency,
                currentLoot: user.CurrentLoot,
                character: user.Character,
                currentStats: user.currentStats,
                maxHP: user.maxHP,
                currentHP: user.CurrentHP,
                currentXP: user.currentXP,
                toLevelUpXP: user.toLevelUpXP,
                currentBoss: currentBoss ? currentBoss._id : null
            }
        })
    }
    catch (err) {
        console.error('Error resetting user progress:', err);
        return res.status(500).json({ error: 'Server error resetting user progress.' });
    }
}

module.exports = { 
    selectCharacter,
    setCurrentBoss,
    defeatBoss,
    returnEnemies,
    fetchEnemyById,
    fetchUserProfile,
    purchaseItem,
    deleteUserProgress
};
