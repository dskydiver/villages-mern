const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = Account = mongoose.model('account', AccountSchema);
