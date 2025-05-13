const JobSeeker = require("../models/JobSeeker");
const SkillAssessment = require("../models/skillAssessment");
const Interview = require("../models/Interview");
const Job = require("../models/Job");

// Create JobSeeker Profile
const createJobSeekerProfile = async (req, res) => {
  try {
    const { skills, experience, education, contact,preferredIndustries } = req.body;
// Manual validation
if (!skills || !experience || !education || !contact) {
  return res.status(400).json({
    message: "All fields (skills, experience, education, contact) are required to create profile"
  });
}

    const userId = req.user._id;
    const existingProfile = await JobSeeker.findOne({  userId });
    if (existingProfile && existingProfile.skills?.length>0) {
      return res.status(400).json({ message: "Profile already exists" });
    }
 // Check if resume was uploaded during registration

 const resumeFromRegister = existingProfile?.resume || null;
 const resumeFile = req.file ? req.file.filename : null;
 const finalResume = resumeFile || resumeFromRegister;

 // If resume was not uploaded at registration and not uploaded now
 if (!finalResume ) {
   return res.status(400).json({ message: "Resume is required to create your profile" });
 }
    const jobSeeker = new JobSeeker({
       userId,
      resume:finalResume,
      skills:JSON.parse(skills),
      experience,
      education,
      contact,
      ...(preferredIndustries && {
      preferredIndustries:JSON.parse(preferredIndustries)
    }),
  });
    await jobSeeker.save();
    res.status(201).json({ message: "Profile created", jobSeeker });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update JobSeeker Profile
const updateProfile = async (req, res) => {
  try {
    const { skills, experience, education, contact } = req.body;
    const resume = req.file ? req.file.filename : undefined;

    const updated = await JobSeeker.findOneAndUpdate(
      { userId: req.user._id },
      {
        ...(skills && { skills }),
        ...(experience && { experience }),
        ...(education && { education }),
        ...(contact && { contact }),
        ...(resume && { resume }),
      },
      { new: true }
    );

    res.status(200).json({ message: "Profile updated", updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get JobSeeker Profile
const getProfile = async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findOne({ userId: req.user._id }).populate("userId");
    if (!jobSeeker) return res.status(404).json({ message: "Profile not found" });
    res.status(200).json(jobSeeker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get Assessment Results
const getAssessmentResults = async (req, res) => {
  try {
    const assessments = await SkillAssessment.find({ jobSeeker: req.user._id }).populate("job");
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Scheduled Interviews
const getScheduledInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ candidate: req.user._id })
      .populate("job")
      .populate("client")
      .populate("hr");

    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 6. Get Final Selected Jobs (based on feedback/rating)
const getFinalSelection = async (req, res) => {
  try {
    const userId = req.user._id;

    const interviews = await Interview.find({
      candidate: userId,
      status: "completed",
      rating: { $gte: 4 }
    }).populate("job");

    const selectedJobs = interviews.map((int) => int.job);
    res.status(200).json(selectedJobs);
  } catch (error) {
    console.error("Final selection error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports ={ 
  createJobSeekerProfile,
  updateProfile,
  getProfile,
  getAssessmentResults,
  getScheduledInterviews,
  getFinalSelection};