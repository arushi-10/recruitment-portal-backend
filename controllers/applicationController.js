const Application = require('../models/Application');
const Job = require("../models/Job");
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const existingApplication = await Application.findOne({ candidate: req.user._id, job: jobId });
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }
    const application = new Application({
      candidate: req.user._id,
      job: jobId,
    });
    await application.save();
    //add to job's applicants array
    await Job.findByIdAndUpdate(jobId,
      { $addToSet:{applicants:req.user._id}}
    );
    const updatedJob = await Job.findById(jobId).populate("applicants");
    console.log("Updated Job:",updatedJob)
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id }).populate({
      path:'job',
    select:"title company industry location salary workType deadline status"  });
    res.status(200).json(applications.map(app => ({
      _id:app._id,
      status:app.status,
      appliedAt:app.appliedAt,
      job:app.job
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markCandidateSelected = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = "selected";
    await application.save();
//Update job's SelectedCandidates array
await Job.findByIdAndUpdate(application.job,{
  $addToSet:{ SelectedCandidates:application.candidate},
});
    res.status(200).json({ message: "Candidate marked as selected", application });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


const markCandidateRejected = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = "rejected";
    await application.save();

    res.status(200).json({ message: "Candidate marked as rejected", application });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting candidate", error });
  }
};
module.exports = { applyForJob, getMyApplications, markCandidateSelected,markCandidateRejected};
