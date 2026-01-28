const express = require("express")
const authMiddleware = require("../middlewares/auth-middleware");
const UserController = require("../controllers/user-controller");
const rolemiddleware = require("../middlewares/role-middleware");

const router = express.Router();

router.post(
  "/register",
  authMiddleware,
  rolemiddleware("customer"),
  UserController.ownerRegister
);

router.post(
  "/approve/:id",
  authMiddleware,
  rolemiddleware("admin"),
  UserController.approveOwnerByAdmin
);

router.post(
  "/reject/:id",
  authMiddleware,
  rolemiddleware("admin"),
  UserController.rejectOwnerByAdmin
);

router.get(
  "/owner-requests",
  authMiddleware,
  rolemiddleware("admin"),
  UserController.getOwnerProfiles
);


module.exports = router
