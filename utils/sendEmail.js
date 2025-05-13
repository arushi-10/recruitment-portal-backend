// utils/emailService.js
const nodemailer = require("nodemailer");

// Configure the email transport (SMTP)
const sendEmail = async function sendEmail(to, subject, htmlContent)  {
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Use Gmail's SMTP service (can be replaced with other email services)
    auth: {
        user: process.env.EMAIL_USER,  // Email ID from env variables
        pass: process.env.EMAIL_PASS   // Email password from env variables
    }
});

// Send email function
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html:htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}

module.exports = sendEmail;