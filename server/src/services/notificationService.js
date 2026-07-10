const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Save an in-app notification to the database
 */
const sendInAppNotification = async (userId, reportId, message) => {
  try {
    await Notification.create({ userId, reportId, message });
  } catch (error) {
    console.error('Failed to create in-app notification:', error.message);
  }
};

/**
 * Send an email notification
 */
const sendEmailNotification = async (email, subject, body) => {
  if (!email) return;
  try {
    await transporter.sendMail({
      from: `"CivicAI" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      text: body,
    });
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
};

module.exports = { sendInAppNotification, sendEmailNotification };
