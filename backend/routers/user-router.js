const UserController = require("../controllers/user-controller");
const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const rolemiddleware = require("../middlewares/role-middleware");
const upload = require("../helpers/image-upload");

const router = express.Router();

router.get(
  "/userlist",
  authMiddleware,
  rolemiddleware("admin"),
  UserController.getUsersList
);
router.delete(
  "/delete/:id",
  authMiddleware,
  rolemiddleware("admin"),
  UserController.deleteUser
);

router.put(
  "/update/:id",
  authMiddleware,
  upload.single('photo'),
  UserController.updateUser
);

router.post(
  "/admin/users",
  authMiddleware,
  rolemiddleware("admin"),
  upload.single('photo'),
  UserController.createUserByAdmin
);

module.exports = router;
