const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
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

  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client"
  },

  interviewType: {
    type: String,
    enum: ["technical", "hr", "final"],
    default: "technical"
  },

  scheduledAt: {
    type: Date,
    required: true
  },

  mode: {
    type: String,
    enum: ["online", "offline"],
    default: "online"
  },

  platform: String, // Zoom, Google Meet, Office Address, etc.

  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled", "rescheduled"],
    default: "scheduled"
  },

  feedback: {
    type: String
  },

  rating: {
    type: Number,
    min: 1,
    max: 5
  },

  rescheduledInfo: {
    oldDate: Date,
    reason: String
  },
  finalDecision: {
  type: String,
  enum: ["pending", "offered", "accepted", "declined", "rejected", "joined"],
  default: "pending",
},

offerLetter: {
  type: String, // You can store filename or link to PDF
  default: null,
},

joiningDate: {
  type: Date,
  default: null,
}
}, { timestamps: true });


module.exports =mongoose.model("Interview", interviewSchema);;