const Interview = require("../models/Interview");

// Schedule a new interview
const scheduleInterview = async (req, res) => {
  try {
    const {
      job,
      candidate,
      hr,
      client,
      interviewType,
      scheduledAt,
      mode,
      platform,
    } = req.body;

    const interview = new Interview({
      job,
      candidate,
      hr,
      client,
      interviewType,
      scheduledAt,
      mode,
      platform,
    });

    await interview.save();
    res.status(201).json({ message: "Interview scheduled successfully", interview });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Reschedule Interview
const rescheduleInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { newDate, reason } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.rescheduledInfo = {
      oldDate: interview.scheduledAt,
      reason,
    };
    interview.scheduledAt = newDate;
    interview.status = "rescheduled";

    await interview.save();
    res.status(200).json({ message: "Interview rescheduled", interview });
  } catch (error) {
    console.error("Reschedule error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Interview Status or Feedback
const updateInterviewStatus = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { status, feedback, rating } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    if (status) interview.status = status;
    if (feedback) interview.feedback = feedback;
    if (rating) interview.rating = rating;

    await interview.save();
    res.status(200).json({ message: "Interview updated", interview });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Interviews for a JobSeeker
const getJobSeekerInterviews = async (req, res) => {
  try {
    const { jobSeekerId } = req.params;

    const interviews = await Interview.find({ candidate: jobSeekerId })
      .populate("job")
      .populate("hr")
      .populate("client");

    res.status(200).json(interviews);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Interviews for HR
const getHRInterviews = async (req, res) => {
  try {
    const { hrId } = req.params;

    const interviews = await Interview.find({ hr: hrId })
      .populate("job")
      .populate("candidate")
      .populate("client");

    res.status(200).json(interviews);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Interviews for Client
const getClientInterviews = async (req, res) => {
  try {
    const { clientId } = req.params;

    const interviews = await Interview.find({ client: clientId })
      .populate("job")
      .populate("candidate")
      .populate("hr");

    res.status(200).json(interviews);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {scheduleInterview,rescheduleInterview,
  updateInterviewStatus,
  getJobSeekerInterviews,getHRInterviews,getClientInterviews
  };