// api/user/userController.js
const UserProfile = require('../auth/authModel'); // UserProfile model is in api/auth/
const CharacterClass = require('../../models/CharacterClass'); // CharacterClass model is now in top-level models/
const InventoryItem = require('../barkeeper/InventoryItem'); // InventoryItem model is in api/barkeeper/
const Boss = require('../global/Boss');
const CommonEnemy = require('../global/CommonEnemy');

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
exports.selectCharacter = async (req, res) => {
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
exports.setCurrentBoss = async (req, res) => {
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
exports.defeatBoss = async (req, res) => {
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

exports.returnEnemies = async (req, res) => {
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

exports.fetchEnemyById = async (req, res) => {
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

exports.fetchUserProfile = async (req, res) => {
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

module.exports = { 
    selectCharacter,
    setCurrentBoss,
    defeatBoss,
    returnEnemies,
    fetchEnemyById,
    fetchUserProfile
};
