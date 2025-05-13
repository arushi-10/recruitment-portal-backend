const mongoose = require("mongoose");

const JobRequestSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobTitle: { type: String, required: true },
  description: { type: String, required: true },
  experienceRequired: { type: String, required: true }, // e.g., "2-5 years"
  skills: [String],
  location: { type: String },
  industry: { type: String, enum: ["Oil & Gas", "Engineering", "Healthcare", "Infrastructure & Construction", "Manufacturing", "Logistics","IT"] },
  salaryRange: { type: String },
  preferredNationality: { type: [String],default:[] },
  language: { type: [String],default:[] }, // e.g., "English, Arabic"
  workType: { type: String, enum: ["Full-time", "Part-time", "Remote", "Contract"] },
  deadline: { type: Date, required: true },
  notes: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected", "posted"], default: "pending" },

  isApproved: { type: Boolean, default: false },
approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin ID
// convertedJobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, // Optional
// assignedHRs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" ,default:null}],
history: [
  {
    action: { type: String, enum: ["submitted","approved", "rejected","resubmitted"], required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Admin
    notes: { type: String },
    date: { type: Date, default: Date.now }
  }
],
  jdFile: { type: String }, // JD document file path
}, { timestamps: true });

module.exports = mongoose.model("JobRequest", JobRequestSchema);