const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const createToken = require("../utils/createToken");
const { sendResetEmail } = require("../helpers/email-service");
const crypto = require("crypto");

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: "customer",
        photo: "",
        isActive: true,
        isDeleted: false,
        ownerApplicationStatus: "none",
      });
      await newUser.save();

      const token = createToken(newUser._id, newUser.role);
      res.cookie("food_deli_token", token, { httpOnly: true });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: newUser,
      });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({
        email: email.toLowerCase(),
      }).select("+password");

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      if (!user.isActive || user.isDeleted) {
        return res.status(403).json({ message: "Account disabled" });
      }

      const token = createToken(user._id, user.role);

      res.cookie("food_deli_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            photo: user.photo,
            isActive: user.isActive,
            isDeleted: user.isDeleted,
            ownerApplicationStatus: user.ownerApplicationStatus,
            deletedAt: user.deletedAt,
          },
          accessToken: token,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("food_deli_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  },

  forgetpassword: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000;

      user.resetToken = resetToken;
      user.resetTokenExpires = resetTokenExpiry;
      await user.save();

      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      const emailSent = await sendResetEmail(
        user.email,
        resetLink,
        user.username
      );

      if (!emailSent) {
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();
        return res
          .status(500)
          .json({ success: false, message: "Email sending failed" });
      }
      return res
        .status(200)
        .json({ success: true, message: "Password reset email sent" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err });
    }
  },

  resetpassword: async (req, res) => {
    const { token, password } = req.body;

    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
      user.passwordChangedAt = Date.now();
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "Password reset successful" });
    } catch (err) {
      return res.status(500).json({ success: false, message: err });
    }
  },
};

module.exports = authController;
