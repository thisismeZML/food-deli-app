const express = require("express");
const PayoutController = require("../controllers/payout-controller");
const authMiddleware = require("../middlewares/auth-middleware");

router.get(
  "/payment-methods",
  authMiddleware,
  PayoutController.getPaymentMethods
);

router.get(
  "/payment-providers/:methodId",
  authMiddleware,
  PayoutController.getPaymentProviders
);

router.get(
  "/payment-instruments/:providerId",
  authMiddleware,
  PayoutController.getPaymentInstruments
);

router.put("/owner-payout/:id", auth, PayoutController.updateOwnerPayout);

const router = express.Router();
