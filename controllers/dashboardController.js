const Client = require("../models/Client");
const HR = require("../models/HR");
const JobSeeker = require("../models/JobSeeker");
const Job = require("../models/Job");

exports.getAdminAnalytics = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const approvedClients = await Client.countDocuments({ isApproved: true });
    const pendingClients = await Client.countDocuments({ isApproved: false });
    const totalHRs = await HR.countDocuments();
    const totalJobSeekers = await JobSeeker.countDocuments();
    const totalUsers = totalClients + totalHRs + totalJobSeekers;

    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: "active" });

    const totalApplications = await Job.aggregate([
      { $unwind: "$applicants" },
      { $count: "totalApplications" }
    ]);
    const totalApplicationsCount = totalApplications[0]?.totalApplications || 0;

    res.json({
      totalUsers,
      totalClients,
      approvedClients,
      pendingClients,
      totalHRs,
      totalJobSeekers,
      totalJobs,
      activeJobs,
      totalApplications: totalApplicationsCount
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard fetch failed", error: error.message });
  }
};

exports.getJobReports = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("applicants", "name email")
      .populate("SelectedCandidates", "name email");

    const report = jobs.map(job => ({
      title: job.title,
      company: job.company,
      totalApplicants: job.applicants?.length || 0,
      totalHired: job.SelectedCandidates?.length || 0
    }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserReports = async (req, res) => {
  try {
    const hrStats = await HR.aggregate([
      { $project: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } } },
      { $group: { _id: { year: "$year", month: "$month" }, count: { $sum: 1 } } },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    const clientStats = await Client.aggregate([
      { $project: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } } },
      { $group: { _id: { year: "$year", month: "$month" }, count: { $sum: 1 } } },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    const jobSeekerStats = await JobSeeker.aggregate([
      { $project: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } } },
      { $group: { _id: { year: "$year", month: "$month" }, count: { $sum: 1 } } },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    res.json({
      hrStats,
      clientStats,
      jobSeekerStats
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};