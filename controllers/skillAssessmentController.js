const SkillAssessment = require("../models/skillAssessment");
const Job = require("../models/Job");
const JobSeeker = require("../models/JobSeeker");
const HR = require("../models/HR");
const sendEmail = require("../utils/sendEmail");

const createAssessment = async (req, res) => {
  try {
    const { job, candidate, type, assessmentLink, deadline, duration } = req.body;
    const hrId = req.user.hrProfileId;

    const hr = await HR.findById(hrId);
    if (!hr) return res.status(404).json({ message: "HR not found" });

    const jobDoc = await Job.findById(job);
    if (!jobDoc) return res.status(404).json({ message: "Job not found" });

    if (!jobDoc.assignedHR || jobDoc.assignedHR.toString() !== hrId.toString()) {
      return res.status(403).json({ message: "You're not assigned to this job" });
    }

    const candidateExists = await JobSeeker.findById(candidate);
    if (!candidateExists) return res.status(404).json({ message: "Candidate not found" });

    const newAssessment = await SkillAssessment.create({
      job,
      candidate,
      hr: hrId,
      type,
      assessmentLink,
      deadline,
      duration,
    });

    res.status(201).json({
      message: "Assessment created successfully",
      data: newAssessment,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create assessment", error: error.message });
  }
};

const submitAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { submissionLink, remarks } = req.body;
    const jobSeekerId = req.user.jobSeekerProfileId;

    const assessment = await SkillAssessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
// Debug: Chech the IDs
console.log("Assessment Candidate:",assessment.candidate);
console.log("Logged-in JobSeeker:",jobSeekerId);
    if (assessment.candidate.toString() !== jobSeekerId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (assessment.status !== "pending") {
      return res.status(400).json({ message: "Assessment already submitted or reviewed" });
    }

    assessment.submissionDate = new Date();
    assessment.status = "submitted";
    assessment.submissionLink = submissionLink;
    assessment.remarks = remarks;

    await assessment.save();

    res.status(200).json({ message: "Assessment submitted successfully", data: assessment });
  } catch (error) {
    res.status(500).json({ message: "Submission failed", error: error.message });
  }
};

const reviewAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { score, hrRemarks, isSelected } = req.body;
    const hrId = req.user.hrProfileId;

    const assessment = await SkillAssessment.findById(assessmentId).populate("job");
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });

    if (assessment.hr.toString() !== hrId.toString()) {
      return res.status(403).json({ message: "Not authorized to review this assessment" });
    }
     if (assessment.status === "reviewed") {
      return res.status(400).json({ message: "Assessment already reviewed" });
    }

    if (assessment.status !== "submitted") {
      return res.status(400).json({ message: "Assessment must be submitted before review" });
    }

    assessment.score = score;
    assessment.status = "reviewed";
    assessment.reviewedByHR = true;
    assessment.SelectedForNextRound = isSelected;
    assessment.remarks = hrRemarks;

    await assessment.save();

    if (isSelected) {
      const candidateUser = await JobSeeker.findById(assessment.candidate).populate("userId");
      const to = candidateUser.userId.email;
      const subject = `🎉 You’ve been shortlisted for ${assessment.job.title}`;
      const html = `
        <h3>Congratulations, ${candidateUser.userId.name}!</h3>
        <p>Your assessment for the role <strong>${assessment.job.title}</strong> has been <strong>qualified</strong> by our HR.</p>
        <p>Please log in to your AJEETS portal to view next steps.</p>
      `;
      await sendEmail(to, subject, html);
    }

    res.status(200).json({
      message: "Assessment reviewed successfully",
      data: {
        nextRoundStatus: assessment.isSelected ? "Qualified" : "Disqualified",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Review failed", error: error.message });
  }
};

const getAllAssessments = async (req, res) => {
  try {
    const assessments = await SkillAssessment.find()
      .populate("job")
      .populate("candidate")
      .populate("hr");

    const withStatus = assessments.map((assessment) => ({
      ...assessment.toObject(),
      nextRoundStatus: assessment.isSelected ? "Qualified" : "Disqualified",
    }));

    res.status(200).json({ success: true, assessments: withStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAssessmentById = async (req, res) => {
  try {
    const assessment = await SkillAssessment.findById(req.params.id)
      .populate("job")
      .populate("candidate")
      .populate("hr");

    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    res.status(200).json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAssessmentsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const assessments = await SkillAssessment.find({ job: jobId })
      .populate("candidate")
      .populate("hr");

    const withStatus = assessments.map((assessment) => ({
      ...assessment.toObject(),
      nextRoundStatus: assessment.isSelected ? "Qualified" : "Disqualified",
    }));

    res.status(200).json({ success: true, data: withStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch assessments", error: error.message });
  }
};

const getMyAssessments = async (req, res) => {
  try {
    const candidateId = req.user.jobSeekerProfileId;
    const assessments = await SkillAssessment.find({ candidate: candidateId })
      .populate("job", "title company location")
      .populate("hr", "name department")
      .sort({ createdAt: -1 });

    const data = assessments.map((a) => ({
      id: a._id,
      jobTitle: a.job.title,
      company: a.job.company,
      type: a.type,
      status: a.status,
      SelectedForNextRound: a.SelectedForNextRound,
      reviewedByHR: a.reviewedByHR,
      remarks: a.remarks,
      score: a.score,
      deadline: a.deadline,
      submissionDate: a.submissionDate,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAssessment,
  submitAssessment,
  reviewAssessment,
  getAllAssessments,
  getAssessmentById,
  getAssessmentsByJob,
  getMyAssessments,
};