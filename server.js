const express = require("express");
const mongoose = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

//  const paymentRoutes = require("./routes/paymentRoutes");
 const adminRoutes = require("./routes/adminRoutes");
 const jobRequestRoutes = require("./routes/jobRequestRoutes");
 const jobSeekerRoutes = require("./routes/jobSeekerRoutes");
 const applicationRoutes = require("./routes/applicationRoutes");
 const interviewRoutes = require("./routes/interviewRoutes");
 const ajeetsFeedbackRoutes = require("./routes/ajeetsFeedbackRoutes");
 const assessmentRoutes = require("./routes/assessmentRoutes");
 const hrRoutes =require("./routes/hrRoutes");
 const candidateFeedbackRoutes = require("./routes/candidateFeedbackRoutes");
const jobMatchingRoutes = require("./routes/jobMatchingRoutes");
 const stripeRoutes =require("./routes/stripeRoutes");
const dashboardRoutes =require("./routes/dashboardRoutes");
const finalSelectionRoutes = require("./routes/finalSelectionRoutes");
// const mockPaymentRoutes = require("./routes/mockPaymentRoutes");
const app = express();


// Middleware
app.use(express.json());
app.use(cors( ));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/job-request", jobRequestRoutes);
app.use("/api/job-seekers", jobSeekerRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/ajeets-feedback", ajeetsFeedbackRoutes);
app.use("/api/candidate-feedback", candidateFeedbackRoutes);
app.use("/api/job-matching", jobMatchingRoutes);
 app.use("/api/stripe", stripeRoutes);
app.use("/api/final-selection",finalSelectionRoutes);
app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/payments", paymentRoutes); // Enable when payment done
// app.use("api/mock",mockPaymentRoutes);



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));