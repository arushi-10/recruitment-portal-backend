const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  makeFinalDecision,
  candidateResponse,
  getMyOffers,
  markCandidateJoined
} = require("../controllers/finalSelectionController");

// HR/Client/Admin makes final decision and uploads offer letter
router.post(
  "/decision/:interviewId",
  authMiddleware,
  roleMiddleware(["hr", "admin", "client"]),
  upload.single("offerLetter"),
  makeFinalDecision
);

// JobSeeker accepts/declines
router.put(
  "/response/:interviewId",
  authMiddleware,
  roleMiddleware(["jobseeker"]),
  candidateResponse
);

// JobSeeker views offered jobs
router.get(
  "/my-offers",
  authMiddleware,
  roleMiddleware(["jobseeker"]),
  getMyOffers
);

// Admin marks as joined
router.put(
  "/mark-joined/:interviewId",
  authMiddleware,
  roleMiddleware(["admin"]),
  markCandidateJoined
);

module.exports = router;