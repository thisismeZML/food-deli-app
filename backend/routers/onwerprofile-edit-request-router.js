const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const OwnerProfileController = require("../controllers/ownerprofile-edit-request-controller");

const router = express.Router();

