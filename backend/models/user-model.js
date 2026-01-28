const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    resetToken: String,
    resetTokenExpires: Date,
    role: {
      type: String,
      enum: ["customer", "admin", "owner"],
      default: "customer",
    },
    photo: {
      type: String,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    passwordChangedAt: Date,
    isActive: { type: Boolean, default: true },
    ownerApplicationStatus: {
    type: String,
    enum: ["none", "pending", "approved", "rejected"],
    default: "none"
  }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
