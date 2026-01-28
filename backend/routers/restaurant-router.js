const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const RestaurantController = require("../controllers/restaurant-controller");
const roleMiddleware = require("../middlewares/role-middleware");
const upload = require("../helpers/image-upload");
// const validationMiddleware = require("../middlewares/validation-middleware");
// const { createRestaurantSchema, updateRestaurantSchema } = require("../validation/restaurant-validation");

const router = express.Router();

// Public routes (no authentication required)
router.get("/public/list", RestaurantController.get);
router.get("/public/:id", RestaurantController.getById);

// Protected routes (require authentication)
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("admin", "owner"),
//   validationMiddleware(createRestaurantSchema),
  RestaurantController.create
);

router.get(
  "/list",
  authMiddleware,
  roleMiddleware("admin", "owner", "customer"),
  RestaurantController.get
);

router.get(
  "/pending-restaurants",
  authMiddleware,
  roleMiddleware("admin"),
  RestaurantController.getPendingRestaurants
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "owner", "customer"),
  RestaurantController.getById
);

router.put(
  "/update/:id",
  authMiddleware,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
//   validationMiddleware(updateRestaurantSchema),
  RestaurantController.update
);

/* router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "owner"),
  RestaurantController.updateStatus
);
 */

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  RestaurantController.delete
);

// Admin only routes
router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  RestaurantController.approveRestaurant
);

router.patch(
  "/:id/suspend",
  authMiddleware,
  roleMiddleware("admin"),
  RestaurantController.suspendRestaurant
);

/* router.get(
  "/admin/pending",
  authMiddleware,
  roleMiddleware("admin"),
  RestaurantController.getPendingRestaurants
); */

// Owner-specific routes
router.get(
  "/owner/my-restaurants",
  authMiddleware,
  roleMiddleware("owner"),
  RestaurantController.getMyRestaurants
);

// Restaurant statistics
/*  router.get(
  "/:id/stats",
  authMiddleware,
  roleMiddleware("admin", "owner"),
  RestaurantController.getStats
); */



module.exports = router;
