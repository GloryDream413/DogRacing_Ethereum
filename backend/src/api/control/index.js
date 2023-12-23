const express = require('express');
const router = express.Router();
const DogRacing = require("./controller");

router.get('/get_deposited_amount', DogRacing.getDepositedAmount);
router.get('/get_leaderboard_info', DogRacing.getLeaderBoardInfo);
router.get('/get_info', DogRacing.getInfo);

router.post('/deposit', DogRacing.deposit);
router.post('/withdraw', DogRacing.withdraw);
router.post('/end_round', DogRacing.calculateAmount);
router.post('/set', DogRacing.setTreasuryInfo);
router.post('/updateDeviceNumber', DogRacing.updateDeviceNumber);
router.post('/exitBtn', DogRacing.exitBtn);
router.post('/playBtn', DogRacing.playBtn);

module.exports = router;
