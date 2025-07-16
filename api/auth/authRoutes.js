const express = require('express');
const router = express.Router();
const { registerUser, loginUser, findUserProfile, verifyEmail, forgotPassword } = require ('./authController');
const {  findAll,create } = require ('./inventoryTest.js');

const verifyToken = require('../global/verifyToken.js');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/find-user', verifyToken, findUserProfile);
router.get('/profile', verifyToken, findUserProfile);
router.post('/verify-email', verifyEmail);          // ✅ Email verification handler
router.post('/forgot-password', forgotPassword);    // ✅ Forgot password handler


// INVENTORY NEEDED FUNCTIONS JUST FOR TESTING
router.get('/inventory', verifyToken, findAll);
router.post('/inventory', verifyToken, create);

module.exports = router;
