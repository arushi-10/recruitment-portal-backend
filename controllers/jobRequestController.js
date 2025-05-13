const JobRequest = require("../models/JobRequest");
const Job = require("../models/Job");
const User = require("../models/User");
const Client =  require("../models/Client");
const HR=  require("../models/HR");
const JobSeeker =  require("../models/JobSeeker");
const BASE_URL = process.env.BASE_URL || "http://localhost:5001"; // for JD file preview
const sendEmail = require("../utils/sendEmail"); // adjust path if needed
const { request } = require("express");

// CLIENT submits job request
const submitJobRequest = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user exists & is a client
    const user = await User.findById(userId);
    if (!user || user.role !== "client") {
      return res.status(403).json({ message: "Access denied. Only clients can submit job requests." });
    }

    // Fetch client profile data
    const clientProfile = await Client.findOne({ userId });
    if (!clientProfile) {
      return res.status(400).json({ message: "Client profile not found." });
    }

    // Create job request
    const newRequest = await JobRequest.create({
      ...req.body,
      jdFile: req.file ? req.file.path : null,
      clientId: userId,
      status:"pending",
      history:[ 
        {
        action:"submitted",
        by:userId,
        },
      ],
    });

    // Notify Admin
    const adminEmail = "admin@ajeets.com";
    const subject = "New Job Request Submitted";

    const html = `
      <h2>New Job Request</h2>
      <p><strong>Client Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Company:</strong> ${clientProfile.companyName || "Not Provided"}</p>
      <p><strong>Job Title:</strong> ${req.body.jobTitle}</p>
      <p><strong>Industry:</strong> ${req.body.industry}</p>
      <p><strong>Deadline:</strong> ${req.body.deadline}</p>
    `;

    await sendEmail(adminEmail, subject, html);

    res.status(201).json({
      message: "Job request submitted successfully. Admin has been notified.",
      jobRequest: newRequest,
    });

  } catch (error) {
    console.error("Job request submission error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
// ADMIN fetches all pending job requests
const getPendingRequests = async (req, res) => {
  try {
    const requests = await JobRequest.find({ status: "pending" })
      .populate({
        path: "clientId",
        select: "name email", // from User model
        model: "User",
      })
      .lean();

    const updatedRequests = await Promise.all(
      requests.map(async (r) => {
        if (!r.clientId || !r.clientId._id) {
          return {
            ...r,
            clientInfo: {
              name: "Unknown",
              email: "Unknown",
              companyName: "Unknown",
            },
            jdFileUrl: r.jdFile ? `${BASE_URL}/${r.jdFile}` : null
          };
        }
      
        const clientProfile = await Client.findOne({ userId: r.clientId._id }).lean();

        return {
          ...r,
          clientInfo: {
            name: r.clientId.name,
            email: r.clientId.email,
            companyName: clientProfile?.companyName || "Not Provided",
        
          },
          jdFileUrl: r.jdFile ?` ${BASE_URL}/${r.jdFile}` : null,
        };
      })
    );

    res.json(updatedRequests);
  } catch (err) {
    console.error("Fetching Requests Error:", err);
    res.status(500).json({ message: "Error fetching job requests." });
  }
};

console.log("Creating job for client:",request.clientId);
// ADMIN approves and converts to a Job post
const approveJobRequest = async (req, res) => {
  try {
    const request = await JobRequest.findById(req.params.id).populate("clientId");
    if (!request) {
      return res.status(404).json({ message: "Job request not found." });
    }
    
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Job request already processed." });
    }
    // console.log("Request.clientId:",request.clientId);
    const clientDetails = await Client.findOne({ userId: request.clientId });

    if (!clientDetails) {
      return res.status(400).json({ message: "Client profile not found for this user" });
    }
    if( !clientDetails.isPartnered   && clientDetails.paymentStatus !== "paid"){
      return res.status(403).json({ message: "Client must complete payment before job approval.", });
    }
    // console.log("creating job for client:",clientDetails._id);
    //validate assigned HR
    let assignedHR = null;
    if (req.body.assignedHR) {
      assignedHR = await HR.findById(req.body.assignedHR).populate("userId");
      if (!assignedHR || assignedHR.userId.role !== "hr" || !assignedHR.userId.isApproved) {
        return res.status(400).json({ message: "Invalid or unapproved HR selected." });
      }
    }
    // Create Job post
    const job = await Job.create({
      title: request.jobTitle,
      description: request.description,
      experienceRequired: request.experienceRequired,
      requiredSkills: request.skills,
      location: request.location,
      industry: request.industry,
      salary: request.salaryRange,
      preferredNationality: request.preferredNationality,
      language: request.language,
      workType: request.workType,
      deadline: request.deadline,
      notes: request.notes,
      jdFile: request.jdFile,
      createdBy: req.user._id,
      postedByAgency: "AJEETS Recruitment",
      isApproved: true,
      status:"approved",
      client:clientDetails._id,
      assignedHR:assignedHR?._id || null
    });

    // Update JobRequest
    request.status = "approved";
    request.isApproved = true;
    request.approvedBy = req.user._id;
    request.convertedJobId = job._id;
    request.history.push({
      action:"approved",
      by:req.user._id,
      notes:`Approved and converted to Job Id:${job._id}`,
      date:new Date(),
    });
    await request.save();

    // Fetch client profile for better email context
    const clientProfile = await Client.findOne({ userId: request.clientId._id });

    // Notify client via email
    const clientEmail = request.clientId.email;
    const subject = "Your Job Request Has Been Approved";
    const html = `
      <h3>Hello ${request.clientId.name},</h3>
      <p>Your job request for <strong>${request.jobTitle}</strong> has been <span style="color: green;"><strong>approved</strong></span>.</p>
      <p>It has now been posted on the AJEETS job board.</p>
      <p><strong>Company:</strong> ${clientDetails.companyName}</p>
    `;
    await sendEmail(clientEmail, subject, html);

    // Optional: populate assigned HR in response
    const populatedJob = await Job.findById(job._id)
      .populate({
        path: "assignedHR",
        populate: { path: "userId", select: "name email" }
      })
      .populate("client", "companyName location industry");

    res.status(201).json({
      message: "Job request approved & job posted.",
      job:populatedJob,
    });
  } catch (err) {
    console.error("Approve Job Error:", err);
    res.status(500).json({ message: "Error approving job request." });
  }
};
// ADMIN rejects a job request
const rejectJobRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    // Find job request and validate status
    const request = await JobRequest.findById(id).populate("clientId");
    if (!request) {
      return res.status(404).json({ message: "Job request not found." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Job request already processed." });
    }

    // Update request status to 'rejected'
    request.status = "rejected";
    request.rejectionReason = rejectionReason || "No reason provided";
    request.rejectedBy = req.user._id;
    request.history.push({
      action:"rejected",
      by:req.user._id,
      notes:rejectionReason || "No reason Provided",
      date:new Date(),
    });
    await request.save();

    // Send rejection email to client
    const clientName = request.clientId.name || "Client";
    const clientEmail = request.clientId.email;
    const subject = "Job Request Rejected";
    const html = `
      <h3>Hello ${clientName},</h3>
      <p>Your job request for <strong>${request.jobTitle}</strong> has been <span style="color: red;"><strong>rejected</strong></span>.</p>
      <p><strong>Reason:</strong> ${request.rejectionReason}</p>
      <p>If you believe this was a mistake, please contact us.</p>
    `;
    await sendEmail(clientEmail, subject, html);

    res.json({ message: "Job request rejected successfully." });
  } catch (err) {
    console.error("Reject Job Error:", err);
    res.status(500).json({ message: "Error rejecting job request." });
  }
};
// CLIENT views their job request history
const getClientJobRequests = async (req, res) => {
  try {
    const clientId = req.user._id;

    // Fetch job requests for the logged-in client
    const requests = await JobRequest.find({ clientId })
      .sort({ createdAt: -1 })
      .lean();

    // Add full URL for JD file if it exists
    const updatedRequests = requests.map((request) => ({
      ...request,
      jdFileUrl: request.jdFile ? `${BASE_URL}/${request.jdFile}` : null,
    }));

    res.json(updatedRequests);
  } catch (err) {
    console.error("Client Requests Error:", err);
    res.status(500).json({ message: "Error fetching your job requests." });
  }
};
// CLIENT resubmits a rejected job request
const resubmitJobRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const requestId = req.params.id;

    // Find the job request
    const jobRequest = await JobRequest.findById(requestId);

    // Check if the job request exists and belongs to the client
    if (!jobRequest || jobRequest.clientId.toString() !== userId.toString()) {
      return res.status(404).json({ message: "Job request not found or access denied." });
    }

    // Allow resubmission only if the status is 'rejected'
    if (jobRequest.status !== "rejected") {
      return res.status(400).json({ message: "Only rejected job requests can be resubmitted." });
    }

    // Update the job request with new details
    const updatedData = {
      ...req.body,
      status: "pending",
      isApproved: false,
      approvedBy: null,
      rejectionReason: null,
      rejectedBy: null,
    };

    // If a new JD file is uploaded, update the jdFile field
    if (req.file) {
      updatedData.jdFile = req.file.path;
    }

    // Add a new entry to the history array
    jobRequest.history.push({
      action: "resubmitted",
      by: userId,
      notes: req.body.notes || "Resubmitted after rejection",
      date: new Date(),
    });

    // Update the job request with the new data
    Object.assign(jobRequest, updatedData);
    await jobRequest.save();

    // Notify Admin
    const adminEmail = "admin@ajeets.com";
    const subject = "Job Request Resubmitted";
    const html = `
      <h2>Job Request Resubmitted</h2>
      <p><strong>Client Name:</strong> ${req.user.name}</p>
      <p><strong>Email:</strong> ${req.user.email}</p>
      <p><strong>Job Title:</strong> ${jobRequest.jobTitle}</p>
      <p>The client has updated and resubmitted the job request for approval.</p>
    `;

    await sendEmail(adminEmail, subject, html);

    res.status(200).json({
      message: "Job request resubmitted successfully. Admin has been notified.",
      jobRequest,
    });
  } catch (error) {
    console.error("Job request resubmission error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
module.exports= {
  submitJobRequest,
  getPendingRequests,
  approveJobRequest,
  rejectJobRequest,
  getClientJobRequests ,
  resubmitJobRequest
}; 