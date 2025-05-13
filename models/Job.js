const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    // company: { type: String, required: true },
    industry: { type: String, required: true, enum: ["Oil & Gas", "Engineering", "Healthcare", "Infrastructure & Construction", "Manufacturing", "Logistics","IT"] },
    location: { type: String, required: true },
    salary: { type: String, required: true },
    workType: { type: String, enum: ["Full-time", "Part-time", "Remote", "Contract"], required: true },
    client:{type: mongoose.Schema.Types.ObjectId,ref:"Client",required:true},
    assignedHR: { type: mongoose.Schema.Types.ObjectId, ref: "HR" ,default:null},
    postedByAgency:{type:String,defaults:"AJEETS Recruitment"},
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" ,default:null}],

     // Job seekers who applied
     requiredSkills:[String],
    SelectedCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobSeeker" }], // Selected candidates
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // HR/Client who posted job
    isApproved: { type: Boolean, default: false }, // Admin approval for job posting
    status:{
      type:String,
      enum:["pending","approved","posted","in-progress","closed"],

      default:"pending",
    },
    ShortlistedCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobSeeker" }], // Selected candidates
    deadline:Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);