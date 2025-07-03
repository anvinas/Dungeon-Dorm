// api/barkeeper/barkeeperController.js

const BarKeeper = require('./barkeeper');       // Corrected path
const User = require('./User');                 // Corrected path (assuming User.js is your authModel in this folder)
const InventoryItem = require('./inventoryItem'); // Corrected path

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
    const userId = req.user.userId; // Extracted from JWT by verifyToken middleware

    // Basic input validation
    if (!itemId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Item ID and a valid quantity are required.' });
    }

    try {
        // Fetch barkeeper and user data concurrently for efficiency
        const barkeeper = await BarKeeper.findById(id).populate('shopInventory.itemId');
        const user = await User.findById(userId);

        if (!barkeeper) {
            return res.status(404).json({ error: 'Barkeeper not found' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the item in the barkeeper's shop inventory
        const itemInShop = barkeeper.shopInventory.find(item => item.itemId._id.toString() === itemId);

        if (!itemInShop) {
            return res.status(404).json({ error: 'Item not found in shop inventory.' });
        }

        const totalPrice = itemInShop.price * quantity;

        // Check if user has enough currency
        if (user.Currency < totalPrice) {
            // Use barkeeper's specific dialogue for insufficient funds, or a generic one
            return res.status(400).json({ error: barkeeper.dialogues.buyFailInsufficientFunds || 'Not enough currency.' });
        }

        // Deduct currency from user
        user.Currency -= totalPrice;

        // Add item to user's inventory
        const existingUserItemIndex = user.CurrentLoot.findIndex(loot => loot.itemId.toString() === itemId);

        if (existingUserItemIndex > -1) {
            // If item already exists in user's inventory, just increase quantity
            user.CurrentLoot[existingUserItemIndex].quantity += quantity;
        } else {
            // Otherwise, add a new entry to user's CurrentLoot
            user.CurrentLoot.push({ itemId: itemId, quantity: quantity });
        }

        // Save the updated user document
        await user.save();

        // Send success response with updated user information and purchased item details
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
    const userId = req.user.userId; // Extracted from JWT by verifyToken middleware

    // Basic input validation
    if (!itemId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Item ID and a valid quantity are required.' });
    }

    try {
        // Fetch barkeeper, user, and item details concurrently
        const [barkeeper, user, itemDetails] = await Promise.all([
            BarKeeper.findById(id),
            User.findById(userId),
            InventoryItem.findById(itemId) // Get item's base information
        ]);

        if (!barkeeper) {
            return res.status(404).json({ error: 'Barkeeper not found' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!itemDetails) {
            return res.status(404).json({ error: 'Item details not found in database.' });
        }

        // Check if user has the item and enough quantity to sell
        const userItemIndex = user.CurrentLoot.findIndex(loot => loot.itemId.toString() === itemId);

        if (userItemIndex === -1 || user.CurrentLoot[userItemIndex].quantity < quantity) {
            // Use barkeeper's specific dialogue for no items, or a generic one
            return res.status(400).json({ error: barkeeper.dialogues.sellFailNoItems || 'You do not have enough of this item to sell.' });
        }

        // Calculate sell price.
        // Important: You should add a 'baseValue' field to your InventoryItem model
        // to represent the intrinsic worth of an item for selling purposes.
        // For example:
        // const InventoryItemSchema = new mongoose.Schema({
        //     name: { type: String, required: true },
        //     baseValue: { type: Number, default: 0 }, // Add this field
        //     healthAmount: { type: Number },
        //     description: { type: String },
        // }, { timestamps: true });
        const itemBaseValue = itemDetails.baseValue || 1; // Default to 1 if baseValue not set on item. YOU SHOULD DEFINE baseValue!
        const sellPrice = (itemBaseValue * barkeeper.buyMultiplier) * quantity;


        // Remove item quantity from user's inventory
        user.CurrentLoot[userItemIndex].quantity -= quantity;
        if (user.CurrentLoot[userItemIndex].quantity <= 0) {
            // If quantity drops to 0 or less, remove the item entry entirely
            user.CurrentLoot.splice(userItemIndex, 1);
        }

        // Add currency to user
        user.Currency += sellPrice;

        // Save the updated user document
        await user.save();

        // Send success response
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
// This function is conceptual. The actual logic would depend heavily
// on what "refresh" means for your game (e.g., restocking, changing items, etc.).
exports.refreshShop = async (req, res) => {
    const { id } = req.params; // ID of the barkeeper
    const userId = req.user.userId; // Extracted from JWT by verifyToken middleware

    try {
        const barkeeper = await BarKeeper.findById(id);
        const user = await User.findById(userId); // You might need user data for refresh logic

        if (!barkeeper || !user) {
            return res.status(404).json({ error: 'Barkeeper or User not found' });
        }

        // --- Implement your specific shop refresh logic here ---
        // Examples of refresh logic:
        // 1. Reset specific item quantities if they were limited:
        //    If your BarKeeper model had `shopInventory: [{ itemId, price, currentStock, maxStock }]`
        //    barkeeper.shopInventory.forEach(item => { item.currentStock = item.maxStock; });
        //    await barkeeper.save();
        // 2. Introduce new random items or rotate stock:
        //    You would need a pool of items and logic to select new ones.
        //    barkeeper.shopInventory = generateNewShopInventory();
        //    await barkeeper.save();
        // 3. Adjust prices based on game events (e.g., if a boss was defeated, prices drop)
        // 4. Triggered by a specific game event, which might be passed in req.body

        // This is a placeholder. You'll need to define what 'refresh' does for your game.
        res.json({ message: 'Shop refresh logic executed (placeholder).', barkeeperShop: barkeeper.shopInventory });

    } catch (err) {
        console.error('Error refreshing shop:', err);
        res.status(500).json({ error: 'Server error during shop refresh.' });
    }
};