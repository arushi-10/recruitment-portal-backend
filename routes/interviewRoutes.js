const express = require('express');
const router = express.Router();

const { scheduleInterview,
  rescheduleInterview,
  updateInterviewStatus,
  getJobSeekerInterviews,
  getHRInterviews,
  getClientInterviews} = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Schedule a new interview
router.post(
  '/schedule',
  authMiddleware,
  roleMiddleware(['admin', 'hr']),
  scheduleInterview
);

// Reschedule an existing interview
router.put(
  '/reschedule/:interviewId',
  authMiddleware,
  roleMiddleware(['admin', 'hr']),
  rescheduleInterview
);

// Update interview status (e.g., completed, cancelled)
router.put(
  '/update-status/:interviewId',
  authMiddleware,
  roleMiddleware(['admin', 'hr', 'client']),
  updateInterviewStatus
);

// View interviews for a specific jobseeker
router.get(
  '/jobseeker/:jobSeekerId',
  authMiddleware,
  roleMiddleware(['jobseeker', 'admin']),
  getJobSeekerInterviews
);

// View interviews for a specific HR
router.get(
  '/hr/:hrId',
  authMiddleware,
  roleMiddleware(['hr', 'admin']),
  getHRInterviews
);

// View interviews for a specific client
router.get(
  '/client/:clientId',
  authMiddleware,
  roleMiddleware(['client', 'admin']),
 getClientInterviews
);

module.exports = router;