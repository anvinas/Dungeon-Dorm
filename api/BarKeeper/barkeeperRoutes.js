const express = require('express');
const router = express.Router();
const barkeeperController = require('./barkeeperController');
const verifyToken = require('../../global/verifyToken'); // Adjust path if needed

// Route to get the barkeeper's shop inventory
// This route typically requires authentication to know which user is asking,
// especially if shop content is personalized or if you need user-specific pricing.
router.get('/:id/shop', verifyToken, barkeeperController.getShopInventory);

// Route to purchase an item from the barkeeper
router.post('/:id/buy', verifyToken, barkeeperController.purchaseItem);

// Route to sell an item to the barkeeper
router.post('/:id/sell', verifyToken, barkeeperController.sellItem);

// Optional: Route to handle shop refresh after a boss attempt (more complex logic might go here)
// router.post('/:id/refreshShop', verifyToken, barkeeperController.refreshShop);

module.exports = router;