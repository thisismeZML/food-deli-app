const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routers/auth-router");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const app = express();
mongoose
  .connect(process.env.MONGOURL)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);

// Error handling middleware
app.use((err, res) => {
    const errorStatus = err.status ? err.status : 500;
    const errorMessage = err.message ? err.message : "Internal Server Error";
    res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack,
    });
})
