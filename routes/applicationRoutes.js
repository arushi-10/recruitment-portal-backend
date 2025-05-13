const express = require('express');
const router = express.Router();
const { applyForJob, getMyApplications, markCandidateSelected,markCandidateRejected} = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/apply', authMiddleware,roleMiddleware('jobseeker'), applyForJob);
router.get('/my-applications', authMiddleware,roleMiddleware('jobseeker'), getMyApplications);

router.put(
  "/mark-selected/:applicationId",
  authMiddleware,
  roleMiddleware(["admin", "hr"]),markCandidateSelected
);

// Mark candidate as rejected
router.put(
  "/mark-rejected/:applicationId",
  authMiddleware,
  roleMiddleware(["admin", "hr"]),
  markCandidateRejected
);

module.exports = router;
