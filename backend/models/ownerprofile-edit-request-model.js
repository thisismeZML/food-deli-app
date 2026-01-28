const mongoose = require("mongoose");

const ownerProfileEditRequestSchema = new mongoose.Schema(
  {
    ownerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OwnerProfile",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: String,

    phone: String,

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
      accountNumber: { type: String, sparse: true },
      accountName: { type: String },
      phone: { type: String },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Keep track of what changed
    changes: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OwnerProfileEditRequest", ownerProfileEditRequestSchema);
