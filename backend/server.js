const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routers/auth-router");
const userRouter = require("./routers/user-router");
const restaurantRouter = require("./routers/restaurant-router");
const OwnerRouter = require("./routers/owner-router");
const CuisineRouter = require("./routers/cuisine-router");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.use(express.static("public"));
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
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/restaurant", restaurantRouter);
app.use("/api/owner", OwnerRouter);
app.use("/api/cuisine", CuisineRouter);

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
