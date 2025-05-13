const mongoose = require("mongoose");

const jobSeekerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resume: { type: String,default:null },
  skills: {
    type:[String],
    required:true 
  },
  experience:{type: String,
    required:false 
  },
  education:{type: String ,
    required:false
  },
  contact: { type: String },
  preferredIndustries:{type:[String],default:[]},
// //   // appliedJobs:[{
// //   //   job:{ type: mongoose.Schema.Types.ObjectId, ref: "Job "},

// // status:{type:String,enum:["Applied","Shortlisted","Assesment Cleared","Interview Scheduled","Rejected","Hired"],
// //   default:"Applied"
// // },
// appliedAt:{type:Date,default:Date.now},

// interview:{
//   date: { type: Date },
//   time:String,
//   Client:{type:mongoose.Schema.Types.ObjectId,ref:"Client"},
//   feedback:String,
// }
// }]
}, { timestamps: true });

module.exports = mongoose.model("JobSeeker", jobSeekerSchema);