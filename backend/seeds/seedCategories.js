const mongoose = require("mongoose");
const Category = require("../models/category-model");
require("dotenv").config();

const defaultCategories = [
  { name: "Fast Food" },
  { name: "Vegan" },
  { name: "Dessert" },
  { name: "Beverages" },
  { name: "Salads" },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGOURL);

    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(defaultCategories);
      console.log("Default categories added!");
    } else {
      console.log("Categories already exist. Skipping.");
    }

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
};

seedCategories();

module.exports = seedCategories;
