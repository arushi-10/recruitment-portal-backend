const express = require("express");
const router = express.Router();
const {
  giveAjeetsFeedback,
  getAllFeedbacks,
  getClientFeedbacks
} = require("../controllers/ajeetsFeedbackController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Client gives feedback about AJEETS
router.post("/", authMiddleware,roleMiddleware(["client"]), giveAjeetsFeedback);

// Admin views all feedback
router.get("/", authMiddleware,roleMiddleware(["admin"]), getAllFeedbacks);

// Client or Admin gets specific client's feedback
router.get("/client/:id", authMiddleware,roleMiddleware(["client", "admin"]), getClientFeedbacks);

module.exports = router;