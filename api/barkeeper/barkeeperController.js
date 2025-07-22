// api/barkeeper/barkeeperController.js

// Import models:
const BarKeeper = require('./Barkeeper'); // Local to this folder
const InventoryItem = require('./InventoryItem'); // Local to this folder
// IMPORTANT: User model is in api/auth/authModel.js and exported as 'UserProfile'
const UserProfile = require('../auth/authModel'); // <--- Correct path and variable name for UserProfile

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
        const barkeeper = await BarKeeper.findById(id).populate('shopInventory.itemId');
        const user = await UserProfile.findById(userId); // <--- Use UserProfile here

        if (!barkeeper) {
            return res.status(404).json({ error: 'Barkeeper not found' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
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

        // Inventory logic: Find if item already exists in user's CurrentLoot
        const existingUserItemIndex = user.CurrentLoot.findIndex(loot => loot.itemId.toString() === itemId);

        if (existingUserItemIndex > -1) {
            // If item exists, update its quantity
            user.CurrentLoot[existingUserItemIndex].quantity += quantity;
        } else {
            // If item is new, push a new object with itemId and quantity
            user.CurrentLoot.push({ itemId: itemId, quantity: quantity });
        }

        await user.save();

        res.json({
            message: barkeeper.dialogues.buySuccess || 'Purchase successful!',
            userCurrency: user.Currency,
            userInventory: user.CurrentLoot,
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
        const [barkeeper, user, itemDetails] = await Promise.all([
            BarKeeper.findById(id),
            UserProfile.findById(userId), // <--- Use UserProfile here
            InventoryItem.findById(itemId)
        ]);

        if (!barkeeper) {
            return res.status(404).json({ error: 'Barkeeper not found' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!itemDetails) {
            return res.status(404).json({ error: 'Item details not found.' });
        }

        // Inventory logic: Check if user has the item and enough quantity
        const userItemIndex = user.CurrentLoot.findIndex(loot => loot.itemId.toString() === itemId);

        if (userItemIndex === -1 || user.CurrentLoot[userItemIndex].quantity < quantity) {
            return res.status(400).json({ error: barkeeper.dialogues.sellFailNoItems || 'You do not have enough of this item to sell.' });
        }

        const itemBaseValue = itemDetails.baseValue || 1; // Ensure 'baseValue' is set in your InventoryItem model/data
        const sellPrice = (itemBaseValue * barkeeper.buyMultiplier) * quantity;

        // Deduct item quantity from user's inventory
        user.CurrentLoot[userItemIndex].quantity -= quantity;
        if (user.CurrentLoot[userItemIndex].quantity <= 0) {
            user.CurrentLoot.splice(userItemIndex, 1); // Remove item entry if quantity drops to 0 or less
        }

        user.Currency += sellPrice;

        await user.save();

        res.json({
            message: barkeeper.dialogues.sellSuccess || 'Item sold successfully!',
            userCurrency: user.Currency,
            userInventory: user.CurrentLoot,
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
        const user = await UserProfile.findById(userId); // <--- Use UserProfile here

        if (!barkeeper || !user) {
            return res.status(404).json({ error: 'Barkeeper or User not found' });
        }

        // --- Your specific shop refresh logic goes here ---
        // E.g., restocking items if you added 'currentStock' and 'maxStock' to your BarKeeper's shopInventory
        // barkeeper.shopInventory.forEach(item => { item.currentStock = item.maxStock; });
        // await barkeeper.save();

        res.json({ message: 'Shop refresh logic executed (placeholder).', barkeeperShop: barkeeper.shopInventory });

    } catch (err) {
        console.error('Error refreshing shop:', err);
        res.status(500).json({ error: 'Server error during shop refresh.' });
    }
};
