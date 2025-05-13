const express = require("express");
const router = express.Router();
const {
  giveCandidateFeedback,
  getFeedbackForCandidate,
  getFeedbackByClient
} = require("../controllers/candidateFeedbackController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Client gives feedback
router.post("/", authMiddleware,roleMiddleware(["client"]), giveCandidateFeedback);

// Admin or Jobseeker view feedback for a candidate
router.get("/candidate/:id", authMiddleware,roleMiddleware(["admin", "jobseeker"]), getFeedbackForCandidate);

// Admin or client views all feedbacks given by client
router.get("/client/:id", authMiddleware,roleMiddleware(["admin", "client"]), getFeedbackByClient);

module.exports = router;