const Job = require("../models/Job");
const JobSeeker = require("../models/JobSeeker");

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate({
        path: "client",
        select: "companyName industry location",
      })
      .populate({
        path: "assignedHR",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "ShortlistedCandidates",
        populate: { path: "userId", select: "name email" },
      });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job", error: error.message });
  }
};

module.exports = { getJobById };