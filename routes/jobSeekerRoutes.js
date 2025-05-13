const express = require("express");
const router = express.Router();


const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const  upload= require("../middleware/uploadMiddleware");
const jobSeekerController = {
  createJobSeekerProfile,
  updateProfile,
  getProfile,
  getAssessmentResults,
  getScheduledInterviews,
  getFinalSelection
} = require("../controllers/jobSeekerController");
// Create JobSeeker profile with resume
router.post(
  "/profile",
  authMiddleware,
  roleMiddleware("jobseeker"),
  upload.single("resumeFile"),  // Middleware for uploading resume
  createJobSeekerProfile
);

// Update JobSeeker profile with new resume
router.put(
  "/profile",
  authMiddleware,
  roleMiddleware("jobseeker"),
  upload.single("resumeFile"),  // Optional resume update
  updateProfile
);

// Get JobSeeker profile
router.get(
  "/profile",
 authMiddleware,
  roleMiddleware("jobseeker"),
  getProfile
);

// Get assessment results
router.get(
  "/assessments",
  authMiddleware,
  roleMiddleware("jobseeker"),
  getAssessmentResults
);

// Get scheduled interviews
router.get(
  "/interviews",
  authMiddleware,
  roleMiddleware("jobseeker"),
  getScheduledInterviews
);

// Get final job selection
router.get(
  "/selected-jobs",
  authMiddleware,
  roleMiddleware("jobseeker"),
  getFinalSelection
);

module.exports = router;