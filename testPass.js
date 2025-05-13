const bcrypt = require("bcrypt");

const passwordToHash = "Admin@123"; // Change this to your desired password

bcrypt.hash(passwordToHash, 10, function(err, hash) {
    if (err) {
        console.error("Error hashing password:", err);
    } else {
        console.log("🔑 Hashed Password:", hash);
    }
});
router.get("/job/:jobId", async (req, res) => {
    try {
      const job = await Job.findById(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json({ message: "Job found", job });
    } catch (error) {
      res.status(500).json({ message: "Error fetching job", error: error.message });
    }
  });