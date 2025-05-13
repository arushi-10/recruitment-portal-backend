const express = require("express");
const router = express.Router();
const { createPaymentIntent } = require("../controllers/stripeController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
  "/create-payment-intent",
  authMiddleware,
  roleMiddleware(["client", "admin"]),
  createPaymentIntent
);

module.exports = router;