// hashAdminPassword.js
const bcrypt = require("bcryptjs");

const hashPassword = async () => {
  const plainPassword = "your_admin_password"; // replace with real one
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(plainPassword, salt);
  console.log("Hashed Password:", hashed);
};

hashPassword();