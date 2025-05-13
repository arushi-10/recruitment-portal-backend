const mongoose = require("mongoose");

const hrSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  department: { type: String },
  contact:{
    type:String
  }
}, { timestamps: true });

module.exports = mongoose.model("HR", hrSchema);















