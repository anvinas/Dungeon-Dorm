// api/user/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('./userController'); // userController is in the same directory
const verifyToken = require('../global/verifyToken.js'); // verifyToken is two levels up to root, then into global/

// @route POST /api/user/select-character
// @desc Allows a user to select their character class (can only be done once)
router.post('/select-character', verifyToken, userController.selectCharacter);

// @route POST /api/user/set-current-boss
// @desc Sets the ID of the boss the user is currently on/facing
router.post('/set-current-boss', verifyToken, userController.setCurrentBoss);

// @route POST /api/user/defeat-boss
// @desc Updates user profile after defeating a boss and progresses to next
router.post('/defeat-boss', verifyToken, userController.defeatBoss);

router.post('/enemies', userController.returnEnemies);
router.post('/enemy/:id', userController.fetchEnemyById);
router.post('/fetch-user', verifyToken, userController.fetchUserProfile);
router.post('/purchase-item', verifyToken, userController.purchaseItem);


// This is all for now, as per your request. No other user-related routes.

module.exports = router;