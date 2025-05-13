const mongoose = require("mongoose");

const candidateFeedbackSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobSeeker",
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },
  performanceRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  communicationRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  overallFitRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  feedbackComments: {
    type: String,
    required: true
  },
  suggestions: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("CandidateFeedback", candidateFeedbackSchema);