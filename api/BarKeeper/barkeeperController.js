const BarKeeper = require('../../models/BarKeeper'); // Adjust path to your model
const User = require('../../models/User'); // Adjust path to your User model (authModel)
const InventoryItem = require('../../models/InventoryItem'); // Adjust path to your model

// @desc    Get barkeeper's shop inventory
// @route   GET /api/barkeeper/:id/shop
// @access  Private (requires token)
exports.getShopInventory = async (req, res) => {
    try {
        const { id } = req.params; // ID of the barkeeper
        const barkeeper = await BarKeeper.findById(id).populate('shopInventory.itemId');

        if (!barkeeper) {
            return res.status(404).json({ error: 'Barkeeper not found' });
        }

        // Return the shop inventory with full item details
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
    const userId = req.user.userId; // From verifyToken middleware

    if (!itemId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Item ID and a valid quantity are required.' });
    }

    try {
        const barkeeper = await BarKeeper.findById(id).populate('shopInventory.itemId');
        const user = await User.findById(userId);

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

        // Deduct currency from user
        user.Currency -= totalPrice;

        // Add item to user's inventory (handle existing items or new ones)
        const existingUserItemIndex = user.CurrentLoot.findIndex(loot => loot.itemId.toString() === itemId);

        if (existingUserItemIndex > -1) {
            user.CurrentLoot[existingUserItemIndex].quantity += quantity;
        } else {
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
    const { id } = req.params; // ID of the barkeeper
    const { itemId, quantity } = req.body; // ID of the item to sell, and quantity
    const userId = req.user.userId; // From verifyToken middleware

    if (!itemId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Item ID and a valid quantity are required.' });
    }

    try {
        const barkeeper = await BarKeeper.findById(id);
        const user = await User.findById(userId);
        const itemDetails = await InventoryItem.findById(itemId); // Get item's base value

        if (!barkeeper) {
            return res.status(404).json({ error: 'Barkeeper not found' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!itemDetails) {
            return res.status(404).json({ error: 'Item details not found.' });
        }

        // Check if user has the item and enough quantity
        const userItemIndex = user.CurrentLoot.findIndex(loot => loot.itemId.toString() === itemId);

        if (userItemIndex === -1 || user.CurrentLoot[userItemIndex].quantity < quantity) {
            return res.status(400).json({ error: barkeeper.dialogues.sellFailNoItems || 'You do not have enough of this item to sell.' });
        }

        // Calculate sell price based on barkeeper's buyMultiplier and item's original price (if available, otherwise estimate)
        // For simplicity, let's assume itemDetails might have a 'basePrice' or we can infer from barkeeper's shop.
        // A common approach is to store a basePrice on the InventoryItem itself.
        // For now, let's assume a simplified calculation if original price isn't on InventoryItem.
        // If an item isn't in the barkeeper's shopInventory, we might need a default selling price from InventoryItem model.
        // For this example, let's assume a 'baseValue' field on InventoryItem or a fixed fallback.
        const itemBaseValue = itemDetails.baseValue || 10; // Placeholder: You should add 'baseValue' to InventoryItem model
        const sellPrice = (itemBaseValue * barkeeper.buyMultiplier) * quantity;


        // Remove item from user's inventory
        user.CurrentLoot[userItemIndex].quantity -= quantity;
        if (user.CurrentLoot[userItemIndex].quantity <= 0) {
            user.CurrentLoot.splice(userItemIndex, 1); // Remove if quantity drops to 0
        }

        // Add currency to user
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
// This function is more conceptual. The actual logic would depend heavily
// on what "refresh" means for your game.
exports.refreshShop = async (req, res) => {
    const { id } = req.params; // ID of the barkeeper
    const userId = req.user.userId; // From verifyToken middleware

    try {
        const barkeeper = await BarKeeper.findById(id);
        const user = await User.findById(userId);

        if (!barkeeper || !user) {
            return res.status(404).json({ error: 'Barkeeper or User not found' });
        }

        // --- Implement your specific shop refresh logic here ---
        // Examples:
        // 1. Reset 'out of stock' flags if you implemented them.
        // 2. Change prices based on game events/time.
        // 3. Introduce new random items.
        // 4. Update the 'shopInventory' array of the barkeeper document.
        //
        // For instance, if shop items had a 'stock' field and it was reduced on purchase:
        // barkeeper.shopInventory.forEach(item => { item.stock = item.maxStock });
        // await barkeeper.save();

        // This is a placeholder. You'll need to define what 'refresh' does.
        res.json({ message: 'Shop refresh logic executed (placeholder).', barkeeperShop: barkeeper.shopInventory });

    } catch (err) {
        console.error('Error refreshing shop:', err);
        res.status(500).json({ error: 'Server error during shop refresh.' });
    }
};