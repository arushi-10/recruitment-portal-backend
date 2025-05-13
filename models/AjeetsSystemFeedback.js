const mongoose = require("mongoose");

const ajeetsFeedbackSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },
  hr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HR",
    required: true
  },
  communicationRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  understandingRequirementsRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  qualityOfCandidatesRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  overallSatisfactionRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  feedbackComments: {
    type: String,
    required: true
  },
  suggestionsForImprovement: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("AjeetsSystemFeedback", ajeetsFeedbackSchema);