const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyName: { type: String, required: true },
  industry: { type: String ,required:true},
  location:String,
  website:{type: String},
  contactPerson:{
    name:String,
    email:String,
    phone:String,
  },
  isPartnered: { type: Boolean, default: false },
  status:{
    type:String,
    enum:["pending","approved","rejected"],
    default:"pending"
  },
  paymentStatus:{
  type:String,
  enum:["pending","paid"],default:"pending"
  },
  verificationDocs:[String],
  notes:String,
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);