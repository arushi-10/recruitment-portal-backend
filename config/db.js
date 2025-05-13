const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGOURI;
    if(!mongoURI ) {
      throw new Error("Mongo URI is not defined in .env file");
    }
    const conn = await mongoose.connect(mongoURI, {
      
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed");
    process.exit(1);
  }
};
connectDB();
module.exports = mongoose;