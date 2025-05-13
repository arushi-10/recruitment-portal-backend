const AjeetsSystemFeedback = require("../models/AjeetsSystemFeedback");

const giveAjeetsFeedback = async (req, res) => {
  try {
    const feedback = await AjeetsSystemFeedback.create(req.body);
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await AjeetsSystemFeedback.find().populate("client hr");
    res.status(200).json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getClientFeedbacks = async (req, res) => {
  try {
    const feedbacks = await AjeetsSystemFeedback.find({ client: req.params.id }).populate("hr");
    res.status(200).json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
module.exports = 
  {
    giveAjeetsFeedback,
    getAllFeedbacks,
    getClientFeedbacks
  };
