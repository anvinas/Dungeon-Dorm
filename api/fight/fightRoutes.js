const express = require('express');
const router = express.Router();
const {startEncounter, userTurnAndEnemyResponse, levelupUser,getActiveEncounter } = require('./fightController.js');
const verifyToken = require('../global/verifyToken.js');


router.post('/startEncounter', verifyToken, startEncounter);
router.post('/userTurn', verifyToken, userTurnAndEnemyResponse);
router.post('/levelup', verifyToken, levelupUser);
router.post('/getActiveEncounter', verifyToken, getActiveEncounter);

module.exports = router;