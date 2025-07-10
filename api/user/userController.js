// api/user/userController.js
const UserProfile = require('../auth/authModel'); // UserProfile model is in api/auth/
const CharacterClass = require('../../models/CharacterClass'); // CharacterClass model is now in top-level models/
const InventoryItem = require('../barkeeper/InventoryItem'); // InventoryItem model is in api/barkeeper/

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