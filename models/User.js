const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase:true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "hr", "client", "jobseeker"],
      required: true,
    },
    
     isApproved: { type: Boolean,default: false },
resetToken:String,
resetTokenExpire:Date
  },
  {
    timestamps:true}
);

  //hashed password before saving
  UserSchema.pre('save',async function(next) {
    if(! 
      this.isModified('password')) return next();
      this.password= await bcrypt.hash(this.password,10);
      next();
 });
 //compare password method
 UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword,
    this.password);
  };
 

module.exports = mongoose.model("User", UserSchema);