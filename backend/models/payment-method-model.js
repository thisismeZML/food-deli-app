const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      enum: ["CASH", "WALLET", "BANK", "CARD"],
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
