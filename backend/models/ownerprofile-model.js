const mongoose = require("mongoose");

const ownerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: String,

    phone: {
      type: String,
      required: true,
    },

    // 🔥 NEW STRUCTURE
    payout: {
      method: { type: mongoose.Schema.Types.ObjectId, ref: "PaymentMethod" },
      provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentProvider",
      },
      instrument: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentInstrument",
      },

      // Additional payment details
      accountNumber: { type: String, sparse: true },
      accountName: { type: String },
      phone: { type: String }, 
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OwnerProfile", ownerProfileSchema);
