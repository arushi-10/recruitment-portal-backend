const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  status: {
    type: String,
    enum: ['applied', 'under_review' ,'assesment_cleared','interview_scheduled', 'selected', 'rejected'],
    default: 'applied',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  interview:{
      date: { type: Date },
      time:String,
      Client:{type:mongoose.Schema.Types.ObjectId,ref:"Client"},
      feedback:String,
    }
    
});

module.exports = mongoose.model('Application', applicationSchema);