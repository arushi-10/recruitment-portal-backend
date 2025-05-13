const Job = require("../models/Job");
const JobSeeker = require("../models/JobSeeker");

// Matching logic based on skills, industry, etc.
const getMatchingCandidates = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Basic matching logic: skill and industry
    const matchedCandidates = await JobSeeker.find({
      skills: { $in: job.requiredSkills },
      preferredIndustries: job.industry,
    });

    res.json(matchedCandidates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching candidates", error });
  }
};

// Shortlist a candidate
const shortlistCandidate = async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.ShortlistedCandidates.includes(candidateId)) 
      {
    return res.status(400).json({message:"Candidate already shortlisted"});
  }
  job.ShortlistedCandidates.push(candidateId)
  console.log("shortlisting :",candidateId,"to job",jobId);
    await job.save();

    res.json({ message: "Candidate shortlisted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error shortlisting candidate", error:error.message });
  }
};
 module.exports = {
  getMatchingCandidates,
  shortlistCandidate,
} ;