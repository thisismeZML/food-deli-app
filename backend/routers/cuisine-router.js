const express = require("express");
const CuisineController = require("../controllers/cuisine-controller");

const router = express();

router.get("/list", CuisineController.get);

module.exports = router
