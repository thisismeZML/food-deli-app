const mongoose = require("mongoose");

const paymentInstrumentSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentProvider",
      required: true,
    },

    type: {
      type: String,
      enum: ["DEBIT", "CREDIT"],
      required: true,
    },

    network: {
      type: String,
      enum: ["VISA", "MASTER"],
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentInstrument", paymentInstrumentSchema);
