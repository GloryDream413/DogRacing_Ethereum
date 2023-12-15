const mongoose = require('mongoose');
const DogRacingSchema = new mongoose.Schema({
  accountId: { type: String, default: "" },
  chain: { type: String, default: "Hedera" },
  depositedAmount: { type: Number, default: 0 },
  allDepositedAmount: { type: Number, default: 0 },
  earningAmount: { type: Number, default: 0 },
  deviceNumber: { type: String, default: "" },
}, { timestamps: true });

module.exports = DogRacing = mongoose.model('DogRacing', DogRacingSchema);
