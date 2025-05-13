const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  getAdminAnalytics,
  getJobReports,
  getUserReports
} = require("../controllers/dashboardController");

// Dashboard Overview
router.get("/dashboard-analytics", authMiddleware, roleMiddleware(["admin"]), getAdminAnalytics);

// Job Reports
router.get("/report/jobs", authMiddleware, roleMiddleware(["admin"]), getJobReports);

// User Registration Reports
router.get("/report/users", authMiddleware, roleMiddleware(["admin"]), getUserReports);

module.exports = router;