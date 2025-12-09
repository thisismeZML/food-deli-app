const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const createToken = require("../utils/createToken");

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

      const newUser = new User({ username, email, password: hashedPassword });
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
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = createToken(user._id, user.role);
      res.cookie("food_deli_token", token, { httpOnly: true });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: user,
      });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  },
};

module.exports = authController;
