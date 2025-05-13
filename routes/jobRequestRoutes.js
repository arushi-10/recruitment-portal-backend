const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const checkClientApproval = require("../middleware/checkClientApproval");
const {
  submitJobRequest,
  getPendingRequests,
  approveJobRequest,
  rejectJobRequest,
  getClientJobRequests ,
  resubmitJobRequest
} = require("../controllers/jobRequestController");
router.put("/reject/:id", authMiddleware, roleMiddleware(["admin"]), rejectJobRequest);
router.get("/client/my-requests", authMiddleware, roleMiddleware(["client"]), getClientJobRequests);


// Clients submit job requirement to AJEETS
router.post(
  "/request-job",
  authMiddleware,
  roleMiddleware(["client"]),
  upload.single("jdFile"),
  submitJobRequest
);

// Admin fetches all pending job requests
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware(["admin"]),
  getPendingRequests
);

// Admin approves job request → creates Job post
router.post(
  "/approve/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  approveJobRequest
);
router.post(
  "/request-job",
  authMiddleware,
  roleMiddleware(["client"]),
  checkClientApproval, // Add this line
  upload.single("jdFile"),
  submitJobRequest
);
// Route for resubmitting a rejected job request
router.put(
  "/resubmit/:id",
  authMiddleware,
  upload.single("jdFile"), // If you're allowing JD file uploads
  resubmitJobRequest
);
module.exports = router;
  


   
    