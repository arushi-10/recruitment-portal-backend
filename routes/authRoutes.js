const express = require("express"); 
const bcrypt = require("bcryptjs");
 const jwt = require("jsonwebtoken");
  const User = require("../models/User"); 
  const HR = require("../models/HR");
const Client = require("../models/Client");
const JobSeeker = require("../models/JobSeeker");
  const authMiddleware = require("../middleware/authMiddleware");
  const roleMiddleware = require("../middleware/roleMiddleware");
   require("dotenv").config();
const sendEmail = require("../utils/sendEmail");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
  // User Registration
router.post("/register",upload.fields(
    [
        {name:"resumeFile",maxCount:1},
        {name:"verificationDocs",macCount:5},

    ]) ,
async (req, res) => {

    try {
        const { name, email, password, role, companyName } = req.body;
        if(!name || !email || !password || !role){
            return res.status(400).json({
                message:"Name,email,password,and role are required",});
            }
            
        // let parsedSkills =[];
        // if(skills){
        //     parsedSkills = JSON.parse(skills);
        // }
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Set default approval status based on role
        let isApproved = false;

        // Admin and HR auto-approval
        if (role === "admin" || role === "hr") {
            isApproved = true;
        } 

        // Clients: Check if they are an existing approved client
        else if (role === "client") {
            const normalizedCompanyName = companyName.trim().toLowerCase();
          const existingClient = await User.findOne({
                    companyName: { $regex: new RegExp(`^${normalizedCompanyName}$`, 'i') },
                 role: "client",
                  isApproved: true });
            if (existingClient) {
                isApproved = true; // Existing clients auto-approved
            }
        } 

        // JobSeekers: Automatically approved
        else if (role === "jobseeker") {
            isApproved = true;
        }

        // Create a new User
        user = new User({
            name,
            email,
            password,
            role,
            companyName,
            isApproved,
        });

        // Save the user
        await user.save();

        // Create a specific model instance based on the role
        if (role === "hr") {
            const hr = new HR({ userId: user._id, department: "HR",...user._doc });
            await hr.save();
        } else if (role === "client") {
            const client = new Client({
                userId: user._id,
                companyName: req.body.companyName,
                industry: req.body.industry,
                location: req.body.location,
                website: req.body.website,
                contactPerson: {
                  name: req.body.contactPersonName,
                  email: req.body.contactPersonEmail,
                  phone: req.body.contactPersonPhone,
                },
                verificationDocs:req.files?.verificationDocs?.map((doc)=>doc.path) || [],
                // Include common User fields
                ...user._doc
              });
            await client.save();
        } else if (role === "jobseeker") {
            const jobSeeker = new JobSeeker({ userId: user._id,
                resume:req.files?.resumeFile?.[0]?.path||null,...user._doc });
            await jobSeeker.save();
        }
       // Return role-specific response message
let message = "";

if (role === "client" && !isApproved) {
  message = "Thank you for registering. Your client profile has been submitted and is pending approval. Our team will review and get back to you shortly.";
} else if (role === "jobseeker") {
  message = "Registration successful. You may now log in to apply for jobs and track your application status.";
} else if (role === "hr") {
  message = "HR account created successfully. You can now manage assigned job postings and candidate evaluations.";
} else if (role === "admin") {
  message = "Admin account created. Full system access granted.";
} else {
  message = "Registration completed successfully.";
}

res.status(201).json({
  success: true,
  message,
  role,
  isApproved,
});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        console.log("User found:", user);

        // Check if user exists
        if (!user) {
            return res.status(401).json({ message: "Invalid emailId" });
        }

        // Compare password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        // console.log("Password match:", isMatch);

        // If password doesn't match
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // If user is not approved and not an admin
        if (user.role !== 'admin' && !user.isApproved) {
            return res.status(403).json({ message: "Account awaiting approval" });
        }
    
        // // Generate JWT token with user details
        // const token = jwt.sign({ id: user._id, role: user.role,
        //     hrProfileId:hrDetails?._id
        //  }, 
        //     process.env.JWT_SECRET, { expiresIn: "1d" });
        //prepare token payload based on role
         const tokenPayload = {
             id: user._id,
              role: user.role,
        };
        // Define response data based on user role
        let roleSpecificData = {};
        let hrProfileId = null;

        if (user.role === "hr") {
            // Fetch HR-specific data
            const hrDetails = await HR.findOne({ userId: user._id });
            if(!hrDetails) {
                return res.status(401).json({message:"HR details not found"});
            }
            tokenPayload.hrProfileId = hrDetails._id;
            roleSpecificData = { department: hrDetails.department || "N/A" };
                // hrProfileId:hrDetails._id };
                // hrProfileId = hrDetails._id;

        } else if (user.role === "client") {
            // Fetch Client-specific data
            const clientDetails = await Client.findOne({ userId: user._id });
            roleSpecificData = { companyName: clientDetails?.companyName || "N/A" };
        } else if (user.role === "jobseeker") {
            // Fetch JobSeeker-specific data
            const jobSeekerDetails = await JobSeeker.findOne({ userId: user._id });
             if(!jobSeekerDetails) {
                return res.status(401).json({message:"JobSeeker details not found"});
            }
            tokenPayload.jobSeekerProfileId = jobSeekerDetails._id;
            roleSpecificData = { resume: jobSeekerDetails?.resume? `${process.env.BASE_URL}/uploads/resumes/${jobSeekerDetails.resume}`: "N/A",
            // jobSeekerProfileId:jobSeekerDetails._id
};
//    jobSeekerProfileId = jobSeekerDetails._id;
        }
        // create JWT token after fetching job details
    
           const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });

            // console.log("Decoded Token:",jwt.verify(token,process.env.JWT_SECRET));

        // Return successful login response with role-specific data
        res.status(200).json({
            message: "Login Successful",
            token,
            user:{
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            ...roleSpecificData // Include role-specific data
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// Forgot Password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a reset token with an expiration time (1 hour)
        const resetToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Construct password reset link
        const resetLink = `${process.env.BASE_URL}/reset-password/${resetToken}`;
   //send HTML email
   const htmlContent = `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
                <h2 style="color:#2c3e50;">Reset Your Password</h2>
                <p style="font-size:16px;">We received a request to reset your password. Click the button below:</p>
                <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background-color:#3498db;color:#fff;text-decoration:none;border-radius:5px;margin:20px 0;">Reset Password</a>
                <p style="font-size:14px;color:#555;">If you didn’t request this, please ignore this email.</p>
                <p style="font-size:14px;color:#555;">This link will expire in 1 hour.</p>
            </div>
        `;
        // console.log("BASE_URL from env:",process.env.BASE_URL);
        // Send the reset token to the user's email
        
         await sendEmail(user.email, 'Password Reset',htmlContent);

        res.json({ message: "Password reset link has been sent to your email", resetLink });  // For testing
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// Reset Password
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Verify the reset token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
   //check if the token is expired
   const expirationTime = decoded.exp * 1000;
   const currentTime = Date.now();
   if (currentTime > expirationTime) {
    return res.status(400).json({message:"Reset token expired. Please request a new one."});
   }
        // // Hash the new password
        // const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password has been successfully reset" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
module.exports = router;