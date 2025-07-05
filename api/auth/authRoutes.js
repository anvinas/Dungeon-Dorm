const express = require('express');
const router = express.Router();
const { registerUser, loginUser, findUserProfile } = require ('./authController');
const verifyToken = require('../global/verifyToken.js');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/find-user', verifyToken, findUserProfile);
router.get('/profile', verifyToken, findUserProfile);

module.exports = router;
