const Job = require("../models/Job");
const HR = require("../models/HR");

// Get jobs assigned to this HR
const getAssignedJobs = async (req, res) => {
  try {
    const hrProfile = await HR.findOne({userId:req.user._id});
    if(!hrProfile){
      return res.status(404).json({message:"HR profile not found"});
    }
    const jobs = await Job.find({ assignedHR: hrProfile._id })
    .populate("client","companyName industry location")
    .populate("createdBy","name email");
    res.status(200).json({success:true,jobs});
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Optional: Get detailed info about a specific job
const getJobDetails = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("client","companyName industry location").populate("assignedHR","department");
    if (!job) return res.status(404).json({ message: "Job not found" });
   // Check if the job is assigned to the logged-in HR
    // if (job.assignedHR?.toString() !== req.user.hrProfileId?.toString()) {
    //   return res.status(403).json({ message: "Access denied. Job not assigned to you." });
    // }

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


module.exports = {
  getAssignedJobs,
    getJobDetails,
  
  } ;
