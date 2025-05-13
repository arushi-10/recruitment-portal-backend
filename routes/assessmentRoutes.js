const express = require("express");
const {
  createAssessment,
  submitAssessment,
  reviewAssessment,
  getAllAssessments,
  getAssessmentById,
  getAssessmentsByJob,
  getMyAssessments ,
} = require("../controllers/skillAssessmentController");

const  authMiddleware  = require("../middleware/authMiddleware");
const roleMiddleware  = require("../middleware/roleMiddleware");
const router = express.Router();

// 1️⃣ Assign assessment (by Admin or HR)
router.post(
  "/create",
  authMiddleware,
  roleMiddleware([ "hr"]),
  createAssessment
);

// 2️⃣ Submit assessment (by Jobseeker)
router.put(
  "/submit/:assessmentId",
  authMiddleware,
  roleMiddleware(["jobseeker"]),
  submitAssessment
);

// 3️⃣ Review assessment (by HR)
router.put(
  "/review/:assessmentId",
  authMiddleware,
  roleMiddleware(["hr"]),
  reviewAssessment
);

// 4️⃣ Get all assessments (Admin only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllAssessments
);

// 5 Get assessments by Job ID (HR or Admin)
router.get(
  "/job/:jobId",
  authMiddleware,
  roleMiddleware(["admin", "hr"]),
  getAssessmentsByJob
);

// 6. Get assessments for a candidate (Jobseeker)
router.get(
  "/my-assessments",
  authMiddleware,
  roleMiddleware(["jobseeker"]),
  getMyAssessments
);
// 7 view secific assessment by ID (Admin or HR
router.get(
  "/:id",
  authMiddleware,
  getAssessmentById
);
module.exports = router;