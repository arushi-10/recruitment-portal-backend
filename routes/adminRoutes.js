const express = require("express");
const bcrypt = require("bcryptjs");
const jwt=require('jsonwebtoken');
const User = require("../models/User");
const HR = require("../models/HR");
const Client = require("../models/Client");
const JobSeeker = require("../models/JobSeeker");
const Job = require("../models/Job");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const sendEmail = require("../utils/sendEmail");
const router = express.Router();

/** ✅ Approve/Reject Client */
router.put("/approve-client/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const approve = req.body.approve === true || req.body.approve === "true";

    const client = await Client.findById(id).populate("userId");
    // if (!client || client.user.role !== "client") {
      if (!client || !client.userId || client.userId.role !== "client") {
        return res.status(400).json({ message: "Invalid client request" });
      }

    client.isApproved = approve;
    client.isPartnered = approve;
    await client.save();

    // await User.findByIdAndUpdate(client.userId._id, { isApproved: approve });
    if (client.userId?._id) {
      await User.findByIdAndUpdate(client.userId._id, { isApproved: approve });
    }
    // ✅ Send payment email after approval
    if (approve) {
      const to = client.userId.email;
      const subject = "Client Approved - Next Step: Complete Payment";
      const html = `
        <h3>Welcome to AJEETS Recruitment, ${client.contactPerson?.name || client.companyName}!</h3>
        <p>Your client profile has been approved.</p>
        <h4>Payment Policy:</h4>
        <ul>
          <li>$6 per Job Posting</li>
          <li>$35/month for unlimited job postings</li>
        </ul>
        <h4>Payment Instructions:</h4>
        <p>You can complete your payment using the following mock link:</p>
        <a href="https://example.com/pay-now">Pay Now</a> <!--  real Razorpay/Stripe later -->

        <h4>Need help?</h4>
        <p>Contact our support team: <a href="mailto:support@ajeets.com">support@ajeets.com</a></p>
      `;
      await sendEmail(to, subject, html);
    }
    console.log("Decoded user from token:", req.user);
console.log("Fetched client:", client);

    res.json({ message: `Client ${approve ? "approved" : "rejected"} `,
      verificationDocs:client.verificationDocs?.map((doc) => 
        `${process.env.BASE_URL}/uploads/verificationDocs/${doc}`) || [],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/** ✅ View All Base Users */
router.get("/users", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/** ✅ View Pending Clients */
router.get("/pending-approvals", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const pendingClients = await Client.find({ isApproved: false }).populate("userId", "-password");
    res.json(pendingClients);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/** ✅ Create HR */
router.post("/create-hr", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { name, email, password, department, contact } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = await new User({
       name,
       email,
        password,
         role: "hr",
         isApproved: true }).save();
    const hr = await new HR({ userId: user._id, department, contact }).save();
   // --------------------- ADD TOKEN GENERATION ---------------------
   const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // --------------------- SEND TOKEN BACK ---------------------
  res.status(201).json({
    message: "HR created successfully",
    token,
    hr: {
      _id: hr._id,
      userId:user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: hr.department,
   contact:hr.contact
    },
  });
} catch (error) {
  res.status(500).json({ message: "Server error", error: error.message });
}
});

/** ✅ View All HRs */
router.get("/all-hrs", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const hrs = await HR.find().populate("userId", "-password");
    res.json(hrs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/** ✅ View All Clients */
router.get("/all-clients", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const clients = await Client.find().populate("userId", "-password");
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/** ✅ View All Job Seekers */
router.get("/all-jobseekers", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const jobseekers = await JobSeeker.find().populate("userId", "-password");
    res.json(jobseekers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/** ✅ View All Jobs */
router.get("/all-jobs", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("postedBy", "name role")
      .populate("applicants", "name email");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/** ✅ Delete Any User */
router.delete("/delete-user/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete from extended model
    if (user.role === "client") await Client.findOneAndDelete({ user: user._id });
    if (user.role === "hr") await HR.findOneAndDelete({ user: user._id });
    if (user.role === "jobseeker") await JobSeeker.findOneAndDelete({ user: user._id });

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

   // Admin Updates Their Profile
router.put("/update-profile", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const { name, email, companyName } = req.body;
        const admin = await User.findById(req.user.id);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
// Ensure new email is not taken by another user
if (email && email !== admin.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
    }
}
        // Update fields if provided
        if (name) admin.name = name;
        if (email) admin.email = email;
        if (companyName) admin.companyName = companyName;

        await admin.save();
        res.json({ message: "Profile updated successfully", admin });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/**
 *  Admin Updates Their Password
 */
router.put("/update-password", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await User.findById(req.user.id);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        admin.password = newPassword;
        await admin.save();
        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

//admin delete a job post
router.delete("/delete-job/:jobId", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findByIdAndDelete(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Route: Assign HR to a Job
router.put("/assign-hr/:jobId", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { hrId } = req.body;

    // Validate Job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Validate HR from extended HR model
    const hr = await HR.findById(hrId).populate("userId");
    console.log("HR found:", hr);
console.log("hr.userId:", hr?.userId);
console.log("Role:", hr?.userId?.role);
console.log("Approved:", hr?.userId?.isApproved);
    if (!hr || !hr.userId || hr.userId.role !== "hr" || !hr.userId.isApproved) {
      return res.status(400).json({ message: "Invalid HR selection" });
    }

    // Assign HR to job
    job.assignedHR = hr._id;
    await job.save();

    console.log(`HR ${hr.userId.name}(${hr.userId.email})has been assigned to job "${job.Jobtitle}"`);
    // Populate assignedHR with HR and User data
    const updatedJob = await Job.findById(job._id).populate({
      path: "assignedHR",
      populate: { path: "userId", select: "name email" }
    })
    .populate("client","companyName country industry" )
    .lean();

    res.json({
      message: "HR assigned successfully",
      job : {
      jobId: updatedJob._id,
      title: updatedJob.title,
      company:updatedJob.client?.companyName,
      industry:updatedJob.client?.industry,
      assignedHR: updatedJob.assignedHR,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//view all job postings & applications
router.get("/jobs", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const jobs = await Job.find().populate("assignedHR", "name email");
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
//view job applicants
router.get("/job-applicants/:jobId", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId).populate("applicants", "name email resume");

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.json(job.applicants);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Admin posts job on behalf of a client
router.post("/create-job", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { title, description, company, location, salary, workType, industry, clientId } = req.body;

    // Check if the client exists in Client model and is approved & partnered
    const client = await Client.findById(clientId).populate("user");

    if (
      !client ||
      !client.user ||
      client.user.role !== "client" ||
      !client.user.isApproved ||
      !client.user.isPartnered
    ) {
      return res.status(400).json({ message: "Invalid client" });
    }

    const newJob = new Job({
      title:express.request.jobTitle,
      description,
      industry,
      location,
      salary,
      workType,
      requiredSkills:request.skills,
      postedByAgency:"AJEETS Recruitment",
     createdBy: client._id, // reference to Client model
    });

    await newJob.save();

    res.json({ message: "Job posted successfully", job: newJob });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// Admin removes HR from a job
router.put("/remove-hr/:jobId", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId).populate("assignedHR");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!job.assignedHR) {
      return res.status(400).json({ message: "No HR assigned to this job" });
    }

    job.assignedHR = null;
    await job.save();

    res.json({ message: "HR unassigned from the job", jobId: job._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// Admin-only: Update user by ID
router.put("/update-user/:userId", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedData = req.body;

    // Find base user
    const baseUser = await User.findById(userId);
    if (!baseUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let ExtendedModel;
    switch (baseUser.role) {
      case "hr":
        ExtendedModel = HR;
        // Remove client-specific fields
        delete updatedData.isPartnered;
        break;
      case "client":
        ExtendedModel = Client;
        // Remove HR-specific fields
        delete updatedData.department;
        break;
      case "jobseeker":
        ExtendedModel = JobSeeker;
        // Remove other role-specific fields
        delete updatedData.isPartnered;
        delete updatedData.department;
        break;
      default:
        return res.status(400).json({ message: "Invalid user role" });
    }

    const updatedUser = await ExtendedModel.findByIdAndUpdate(userId, updatedData, { new: true });
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Mark payment as paid for a client (simulate payment)
router.put(
  "/mark-payment-paid/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const client = await Client.findById(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      client.paymentStatus = "paid";
      await client.save();

      res.json({ message: "Payment marked as paid for this client." });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);
// Promote client to Recruitment Partner
router.put("/clients/make-partner/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    client.isPartnered = true;
    await client.save();

    res.status(200).json({ message: "Client promoted to Recruitment Partner", client });
  } catch (err) {
    res.status(500).json({ message: "Failed to update client", error: err.message });
  }
});
module.exports = router;








