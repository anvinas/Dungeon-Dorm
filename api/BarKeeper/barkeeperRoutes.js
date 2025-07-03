const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require ('./barkeeperController.js');
const verifyToken = require('../global/verifyToken.js');


router.post('/register', registerUser);
router.post('/login', loginUser);
//router.post('/profile', verifyToken, getUserProfile);


module.exports = router;
