const nodemailer = require('nodemailer');
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Transporter verification failed:', error);
  } else {
    console.log('✅ Transporter is ready to send emails');
  }
});

const sendResetEmail = async (userEmail, resetLink, userName) => {
  try {
    console.log('📤 Attempting to send reset email to:', userEmail);

    const mailOptions = {
      from: `"Food Delivery App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
               Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            If the button doesn't work, copy and paste this link in your browser:<br>
            ${resetLink}
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Reset email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    console.log('📤 Attempting to send welcome email to:', userEmail);

    const mailOptions = {
      from: `"Food Delivery App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Welcome to Our App!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${userName}!</h2>
          <p>Your account has been created successfully.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login"
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
               Login to Your Account
            </a>
          </div>
          <p>We're excited to have you on board!</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error);
    return false;
  }
};

const sendOwnerWelcomeEmail = async (userEmail, userName) => {
  try {
    console.log('📤 Attempting to send welcome email to:', userEmail);

    const mailOptions = {
      from: `"Food Delivery App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Welcome to Our App!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${userName}!</h2>
          <p>Your account has been upgrade to owner.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login"
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
               Login to Your Account
            </a>
          </div>
          <p>We're excited to have you on board!</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error);
    return false;
  }
};

const sendOwnerRejectEmail = async (userEmail, userName) => {
  try {
    console.log('📤 Attempting to send welcome email to:', userEmail);

    const mailOptions = {
      from: `"Food Delivery App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Sorry You Are Rejected!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${userName}!</h2>
          <p>Your account has been upgrade to owner.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login"
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
               Login to Your Account
            </a>
          </div>
          <p>We are sorry you are rejected!, please try to complete all of infomation about your store</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error);
    return false;
  }
};

const sendEditRequestApprovedEmail = async (userEmail, userName) => {
  try {
    console.log('📤 Attempting to send welcome email to:', userEmail);

    const mailOptions = {
      from: `"Food Delivery App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Edit Request Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${userName}!</h2>
          <p>Your account has been upgrade to owner.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login"
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
               Login to Your Account
            </a>
          </div>
          <p>We're excited to have you on board!</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error);
    return false;
  }
};

const sendEditRequestRejectedEmail = async (userEmail, userName) => {
  try {
    console.log('📤 Attempting to send welcome email to:', userEmail);

    const mailOptions = {
      from: `"Food Delivery App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Edit Request Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${userName}!</h2>
          <p>Your account has been upgrade to owner.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login"
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
               Login to Your Account
            </a>
          </div>
          <p>We're excited to have you on board!</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error);
    return false;
  }
};

module.exports = { sendResetEmail, sendWelcomeEmail, sendOwnerWelcomeEmail, sendOwnerRejectEmail, sendEditRequestApprovedEmail, sendEditRequestRejectedEmail };
