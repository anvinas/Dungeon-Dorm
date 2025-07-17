// api/barkeeper/barkeeperController.js

// Import models:
const BarKeeper = require('./BarKeeper');
const InventoryItem = require('./InventoryItem');
// IMPORTANT: User model is in api/auth/authModel.js and exported as 'UserProfile'
const UserProfile = require('../auth/authModel'); // Correct path and variable name for UserProfile

// @desc    Get barkeeper's shop inventory
// @route   GET /api/barkeeper/:id/shop
// @access  Private (requires token)
exports.getShopInventory = async (req, res) => {
    try {
        const { id } = req.params; // ID of the barkeeper
        // Populate 'itemId' to get full details of each item in the shop
        const barkeeper = await BarKeeper.findById(id).populate('shopInventory.itemId');

        if (!barkeeper) {
            return res.status(404).json({ error: 'Barkeeper not found' });
        }

        res.json({ shopInventory: barkeeper.shopInventory });

    } catch (err) {
        console.error('Error fetching barkeeper shop inventory:', err);
        res.status(500).json({ error: 'Server error while fetching shop inventory' });
    }
};

// @desc    Purchase an item from the barkeeper
// @route   POST /api/barkeeper/:id/buy
// @access  Private (requires token)
exports.purchaseItem = async (req, res) => {
    const { id } = req.params; // ID of the barkeeper
    const { itemId, quantity } = req.body; // ID of the item to purchase, and quantity
    const userId = req.user.userId; // Extracted from JWT by verifyToken middleware

    if (!itemId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Item ID and a valid quantity are required.' });
    }

    try {
        // Fetch barkeeper, user, AND the details of the item being purchased.
        // Populate 'Character' to update the equipped weapon directly.
        const [barkeeper, user, itemDetails] = await Promise.all([
            BarKeeper.findById(id).populate('shopInventory.itemId'),
            UserProfile.findById(userId)
                .populate('Character')
                .populate({
                    path: 'CurrentLoot.itemId', // IMPORTANT: Populate item details within user's inventory
                    model: 'InventoryItem'
                }),
            InventoryItem.findById(itemId) // Fetch itemDetails for the item being bought
        ]);

        if (!barkeeper) {
            return res.status(404).json({ error: 'Barkeeper not found' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!itemDetails) { // Check if item details were found for the item being bought
            return res.status(404).json({ error: 'Item not found in database.' });
        }
        if (!user.Character) { // Ensure user has a character assigned
            return res.status(400).json({ error: 'User does not have a character assigned.' });
        }

        const itemInShop = barkeeper.shopInventory.find(item => item.itemId._id.toString() === itemId);

        if (!itemInShop) {
            return res.status(404).json({ error: 'Item not found in shop inventory.' });
        }

        const totalPrice = itemInShop.price * quantity;

        if (user.Currency < totalPrice) {
            return res.status(400).json({ error: barkeeper.dialogues.buyFailInsufficientFunds || 'Not enough currency.' });
        }

        user.Currency -= totalPrice;

        // --- NEW LOGIC FOR WEAPONS (FIXED: using itemDetails.itemType) ---
        if (itemDetails.itemType === 'Weapon') { // <<<--- FIX: Changed from .type to .itemType
            // Filter out any existing item in CurrentLoot that is of 'Weapon' type.
            user.CurrentLoot = user.CurrentLoot.filter(lootItem => {
                // Ensure lootItem.itemId is populated and has itemType, then check if it's a Weapon
                return lootItem.itemId && lootItem.itemId.itemType !== 'Weapon'; // <<<--- FIX: Changed from .type to .itemType
            });

            // Add the new weapon to CurrentLoot (assuming quantity 1 for equipped weapons)
            user.CurrentLoot.push({ itemId: itemId, quantity: 1 });

            // Equip the new weapon to the character
            user.Character.weapon = itemId;

            // Mark Character as modified (Mongoose sometimes needs this for nested objects)
            user.markModified('Character');
        } else {
            // Original logic for non-weapon items: Find if item already exists in user's CurrentLoot
            const existingUserItemIndex = user.CurrentLoot.findIndex(loot => loot.itemId._id.toString() === itemId);

            if (existingUserItemIndex > -1) {
                // If item exists, update its quantity
                user.CurrentLoot[existingUserItemIndex].quantity += quantity;
            } else {
                // If item is new, push a new object with itemId and quantity
                user.CurrentLoot.push({ itemId: itemId, quantity: quantity });
            }
        }
        // --- END NEW LOGIC FOR WEAPONS ---

        await user.save();

        res.json({
            message: barkeeper.dialogues.buySuccess || 'Purchase successful!',
            userCurrency: user.Currency,
            userInventory: user.CurrentLoot,
            userCharacterWeapon: user.Character.weapon, // Confirm new equipped weapon
            purchasedItem: {
                itemId: itemInShop.itemId._id,
                name: itemInShop.itemId.name,
                price: itemInShop.price,
                quantity: quantity
            }
        });

    } catch (err) {
        console.error('Error purchasing item:', err);
        res.status(500).json({ error: 'Server error during purchase.' });
    }
};

// @desc    Sell an item to the barkeeper
// @route   POST /api/barkeeper/:id/sell
// @access  Private (requires token)
exports.sellItem = async (req, res) => {
    const { id } = req.params;
    const { itemId, quantity } = req.body;
    const userId = req.user.userId;

    if (!itemId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Item ID and a valid quantity are required.' });
    }

    try {
        // Populate 'Character' and 'CurrentLoot.itemId' for necessary checks
        const [barkeeper, user, itemDetails] = await Promise.all([
            BarKeeper.findById(id),
            UserProfile.findById(userId)
                .populate('Character')
                .populate({
                    path: 'CurrentLoot.itemId', // IMPORTANT: Populate item details within user's inventory
                    model: 'InventoryItem'
                }),
            InventoryItem.findById(itemId) // Fetch itemDetails for the item being sold
        ]);

        if (!barkeeper) {
            return res.status(404).json({ error: 'Barkeeper not found' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!itemDetails) { // Check if item details were found for the item being sold
            return res.status(404).json({ error: 'Item details not found.' });
        }
        if (!user.Character) {
            return res.status(400).json({ error: 'User does not have a character assigned.' });
        }

        // --- NEW LOGIC: Prevent selling Key Items (FIXED: using itemDetails.itemType) ---
        console.log(`\n--- DEBUG: SELL KEY ITEM CHECK for itemId: ${itemId} ---`);
        console.log(`[SELL] itemDetails.name: ${itemDetails.name}, itemDetails.itemType: '${itemDetails.itemType}'`);
        console.log(`[SELL] Comparison: '${itemDetails.itemType}' === 'Key'`);
        console.log(`[SELL] Result: ${itemDetails.itemType === 'Key'}`);

        if (itemDetails.itemType === 'Key') { // <<<--- FIX: Changed from .type to .itemType
            console.log("DEBUG: [SELL] Key item detected. Sending 403 Forbidden. This should terminate the function.");
            return res.status(403).json({ error: 'Key items cannot be sold.' });
        }
        // --- END NEW LOGIC ---

        const userItemIndex = user.CurrentLoot.findIndex(loot => loot.itemId._id.toString() === itemId); // Use _id because it's populated

        if (userItemIndex === -1 || user.CurrentLoot[userItemIndex].quantity < quantity) {
            return res.status(400).json({ error: barkeeper.dialogues.sellFailNoItems || 'You do not have enough of this item to sell.' });
        }

        const itemBaseValue = itemDetails.baseValue || 1;
        const sellPrice = (itemBaseValue * barkeeper.buyMultiplier) * quantity;

        // Deduct item quantity from user's inventory
        user.CurrentLoot[userItemIndex].quantity -= quantity;
        if (user.CurrentLoot[userItemIndex].quantity <= 0) {
            user.CurrentLoot.splice(userItemIndex, 1); // Remove item entry if quantity drops to 0 or less
        }

        // --- NEW LOGIC FOR SELLING EQUIPPED WEAPON (FIXED: using itemDetails.itemType) ---
        if (itemDetails.itemType === 'Weapon' && user.Character.weapon && user.Character.weapon.toString() === itemId) { // <<<--- FIX: Changed from .type to .itemType
            console.warn(`Equipped weapon (ID: ${itemId}) was sold. Character's weapon needs to be updated.`);
            // IMPORTANT: CharacterClass.weapon is `required: true`. It cannot be set to null.
            // You MUST ensure user.Character.weapon is updated to a valid weapon ID (e.g., a default starter weapon).
        }
        // --- END NEW LOGIC ---

        user.Currency += sellPrice;

        await user.save();

        res.json({
            message: barkeeper.dialogues.sellSuccess || 'Item sold successfully!',
            userCurrency: user.Currency,
            userInventory: user.CurrentLoot,
            userCharacterWeapon: user.Character.weapon, // Current equipped weapon after sale
            soldItem: {
                itemId: itemDetails._id,
                name: itemDetails.name,
                soldPrice: sellPrice,
                quantity: quantity
            }
        });

    } catch (err) {
        console.error('Error selling item:', err);
        res.status(500).json({ error: 'Server error during selling.' });
    }
};

// @desc    Refresh barkeeper's shop (e.g., after boss battle)
// @route   POST /api/barkeeper/:id/refreshShop (Optional)
// @access  Private (requires token)
exports.refreshShop = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const barkeeper = await BarKeeper.findById(id);
        const user = await UserProfile.findById(userId);

        if (!barkeeper || !user) {
            return res.status(404).json({ error: 'Barkeeper or User not found' });
        }

        res.json({ message: 'Shop refresh logic executed (placeholder).', barkeeperShop: barkeeper.shopInventory });

    } catch (err) {
        console.error('Error refreshing shop:', err);
        res.status(500).json({ error: 'Server error during shop refresh.' });
    }
};