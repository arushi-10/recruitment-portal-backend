// middleware/checkClientApproval.js
const User = require("../models/User");

const checkClientApproval = async (req, res, next) => {
  try {
    const client = await User.findById(req.user._id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    if (!client.isApproved) {
      return res.status(403).json({
        message:
          "Your account is not approved to submit job requests. Please wait for admin approval.",
      });
    }

    next();
  } catch (error) {
    console.error("Client approval check error:", error);
    res.status(500).json({ message: "Server error during approval check" });
  }
};

module.exports = checkClientApproval;