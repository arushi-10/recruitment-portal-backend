const CandidateFeedback = require("../models/CandidateFeedback");

exports.giveCandidateFeedback = async (req, res) => {
  try {
    const feedback = await CandidateFeedback.create(req.body);
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeedbackForCandidate = async (req, res) => {
  try {
    const feedback = await CandidateFeedback.find({ candidate: req.params.id })
    .populate("job client")
    .populate({
      path:'job',
      populate:[
        { path:'SelectedCandidates',select:'userId'},
        { path:'applicants',select:'userId'}
      ]
    });
    res.status(200).json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeedbackByClient = async (req, res) => {
  try {
    const feedback = await CandidateFeedback.find({ client: req.params.id }).populate("candidate job");
    res.status(200).json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};