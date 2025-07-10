// api/user/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('./userController'); // userController is in the same directory
const verifyToken = require('../global/verifyToken.js'); // verifyToken is two levels up to root, then into global/

// @route POST /api/user/select-character
// @desc Allows a user to select their character class (can only be done once)
router.post('/select-character', verifyToken, userController.selectCharacter);

// This is all for now, as per your request. No other user-related routes.

module.exports = router;