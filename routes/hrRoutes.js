const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {getJobById} = require("../controllers/jobController");
const {
  getAssignedJobs,
  getJobDetails,
} = require("../controllers/hrController");

// HR sees all jobs assigned to them
router.get(
  "/assigned-jobs",
  authMiddleware,
  roleMiddleware(["hr"]),
  getAssignedJobs
);

// HR sees job details (optional, if needed)
router.get(
  "/job/:id",
  authMiddleware,
  roleMiddleware(["hr"]),
  getJobDetails
);

router.get(
  "/job/:jobId", 
  authMiddleware,
  roleMiddleware(["admin", "hr"]),
   getJobById
  );
module.exports = router;