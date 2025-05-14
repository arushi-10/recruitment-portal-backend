// models/SkillAssessment.js
const mongoose = require("mongoose");

const skillAssessmentSchema = new mongoose.Schema({
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

  hr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HR",
    required: true
  },

  type: {
    type: String,
    enum: ["coding", "aptitude", "custom-task"],
    default: "custom-task"
  },

  assessmentLink: String, // e.g., HackerRank or internal link
  
  deadline:{
    type:Date,
    required:true,
  },
  duration:{
    type:Number,
    required:true
  },
  submissionDate: Date,
  submissionLink: String,
  score: Number,

  status: {
    type: String,
    enum: ["pending", "submitted", "reviewed"],
    default: "pending"
  },
reviewedByHR:{
  type:Boolean,
  default:false,
},
SelectedForNextRound:{
  type:Boolean,
  default:false,
},
  remarks: String
}, { timestamps: true });


module.exports =mongoose.model("SkillAssessment", skillAssessmentSchema); 