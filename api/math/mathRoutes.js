const express = require('express');
const router = express.Router();
const { roll, applyNewStats } = require ('./mathController');
const verifyToken = require('../global/verifyToken.js');

router.post('/roll', registerUser);