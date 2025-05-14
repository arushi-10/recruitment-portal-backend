const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "ajeets";

    if (file.fieldname === "resumeFile") {
      folder = "ajeets/resumes";
    } else if (file.fieldname === "jdFile") {
      folder = "ajeets/jds";
    } else if (file.fieldname === "offerLetter") {
      folder = "ajeets/offerLetters";
    } else if (file.fieldname === "verificationDocs") {
      folder = "ajeets/verificationDocs";
    }

    return {
      folder,
      allowed_formats: ["pdf", "doc", "docx"],
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({ storage });

module.exports = upload;