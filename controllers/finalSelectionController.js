const Interview = require("../models/Interview");

const makeFinalDecision = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.finalDecision = "offered";
    interview.offerLetter = req.file ? req.file.path : null;
    await interview.save();

    res.status(200).json({ message: "Offer made to candidate", interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const candidateResponse = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { decision } = req.body;

    if (!["accepted", "declined"].includes(decision)) {
      return res.status(400).json({ message: "Invalid response" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.finalDecision = decision;
    await interview.save();

    res.status(200).json({ message: `You have ${decision} the offer.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyOffers = async (req, res) => {
  try {
    const interviews = await Interview.find({
      candidate: req.user.jobSeekerProfileId,
      finalDecision: "offered"
    }).populate("job client hr");

    res.status(200).json({ offers: interviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markCandidateJoined = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.finalDecision = "joined";
    interview.joiningDate = new Date();
    await interview.save();

    res.status(200).json({ message: "Candidate marked as joined", interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};
module.exports = {makeFinalDecision,
   candidateResponse ,
   getMyOffers,
   markCandidateJoined ,
  };