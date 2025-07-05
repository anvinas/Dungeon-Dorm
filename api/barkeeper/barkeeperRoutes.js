// api/barkeeper/barkeeperRoutes.js
const express = require('express');
const router = express.Router();
const barkeeperController = require('./barkeeperController');
// Path to verifyToken from api/barkeeper/ folder: Go up two levels to root (../../) then into global/
const verifyToken = require('../global/verifyToken.js');

// Route to get the barkeeper's shop inventory
router.get('/:id/shop', verifyToken, barkeeperController.getShopInventory);

// Route to purchase an item from the barkeeper
router.post('/:id/buy', verifyToken, barkeeperController.purchaseItem);

// Route to sell an item to the barkeeper
router.post('/:id/sell', verifyToken, barkeeperController.sellItem);

// Optional: Route to handle shop refresh after a boss attempt (if needed)
// router.post('/:id/refreshShop', verifyToken, barkeeperController.refreshShop);

module.exports = router;