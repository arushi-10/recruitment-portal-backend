const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  getMatchingCandidates,
  shortlistCandidate,
} = require("../controllers/jobMatchingController");

// HR fetches matching candidates for a job
router.get(
  "/:jobId/match-candidates",
  authMiddleware,
  roleMiddleware(["hr"]),
  getMatchingCandidates
);

// HR shortlists a candidate
router.post(
  "/:jobId/shortlist/:candidateId",
  authMiddleware,
  roleMiddleware(["hr"]),
  shortlistCandidate
);

module.exports = router;