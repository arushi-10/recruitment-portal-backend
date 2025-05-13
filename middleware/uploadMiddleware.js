const multer = require("multer");
const path = require("path");

// Configure multer storage for both resumes and JD files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "resumeFile") {
      cb(null, "uploads/resumes"); // store resume files in uploads/resumes/
    } else if (file.fieldname === "jdFile") {
      cb(null, "uploads/jds"); // store JD files in uploads/jds/
     } else if (file.fieldname === "offerLetter") {
      cb(null, "uploads/offerLetter"); // store JD files in uploads/jds/
    } else if(file.fieldname == "verificationDocs"){
      cb(null,"uploads/verificationDocs");
    }
     else {
      cb(new Error("Invalid field name"), false); // Handle unknown field names
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Generate unique filename
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed file types for both resumes and JDs
  const allowedTypes = [
    "application/pdf",
    "application/msword", // DOC files
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX files
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Allow the file
  } else {
    cb(new Error("Only PDF, DOC, or DOCX files are allowed"), false); // Reject other file types
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;