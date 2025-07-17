const express = require('express');
const router = express.Router();
const { registerUser, loginUser, findUserProfile, verifyEmail, forgotPassword, resetPassword } = require ('./authController');
const verifyToken = require('../global/verifyToken.js');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/find-user', verifyToken, findUserProfile);
router.get('/profile', verifyToken, findUserProfile);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;