const mongoose = require("mongoose");
const Cuisine = require("../models/cuisine-model");
require("dotenv").config();

const cuisines = [
  { name: "Italian" },
  { name: "Chinese" },
  { name: "Indian" },
  { name: "Thai" },
  { name: "Mexican" },
  { name: "Japanese" },
];

const seedCuisines = async () => {
  try {
    await mongoose.connect(process.env.MONGOURL);

    const count = await Cuisine.countDocuments();
    if (count === 0) {
      await Cuisine.insertMany(cuisines);
      console.log("Default cuisines added!");
    } else {
      console.log("Cuisines already exist. Skipping.");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

seedCuisines();
