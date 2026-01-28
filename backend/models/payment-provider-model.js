const mongoose = require("mongoose");

const paymentProviderSchema = new mongoose.Schema(
  {
    method: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentProvider", paymentProviderSchema);
