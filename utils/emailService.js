const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@huntjob.com',
      to: userEmail,
      subject: 'Welcome to HuntJob!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to HuntJob, ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with HuntJob. We're excited to have you on board.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Whether you're looking for your next opportunity or seeking top talent, 
            HuntJob is here to help you succeed.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              If you didn't create this account, please ignore this email.
            </p>
          </div>
        </div>
      `
    });
    console.log(`Welcome email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (userEmail, resetToken, userName) => {
  try {
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@huntjob.com',
      to: userEmail,
      subject: 'Reset Your HuntJob Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #666; line-height: 1.6;">
            Hi ${userName},
          </p>
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password. Click the link below to set a new password:
          </p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    });
    console.log(`Password reset email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

/**
 * Send job application notification to manager
 */
const sendApplicationNotification = async (managerEmail, applicantName, jobTitle, applicantEmail) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@huntjob.com',
      to: managerEmail,
      subject: `New Application: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Job Application</h2>
          <p style="color: #666; line-height: 1.6;">
            You have a new application for the position of <strong>${jobTitle}</strong>.
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Applicant:</strong> ${applicantName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${applicantEmail}</p>
            <p style="margin: 10px 0;"><strong>Applied On:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="margin-top: 30px;">
            <a href="${process.env.APP_URL}/manager/applications-list" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Review Application
            </a>
          </div>
        </div>
      `
    });
    console.log(`Application notification sent to ${managerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending application notification:', error);
    return false;
  }
};

/**
 * Send job posting confirmation
 */
const sendJobPostingConfirmation = async (managerEmail, jobTitle, jobId) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@huntjob.com',
      to: managerEmail,
      subject: `Job Posted: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Job Posted Successfully</h2>
          <p style="color: #666; line-height: 1.6;">
            Your job posting for <strong>${jobTitle}</strong> has been published successfully!
          </p>
          <p style="color: #666; line-height: 1.6;">
            Job ID: <code style="background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px;">${jobId}</code>
          </p>
          <div style="margin-top: 30px;">
            <a href="${process.env.APP_URL}/manager/my-jobs" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View My Jobs
            </a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Your job posting is now live and visible to applicants.
          </p>
        </div>
      `
    });
    console.log(`Job posting confirmation sent to ${managerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending job posting confirmation:', error);
    return false;
  }
};

/**
 * Send application status update to applicant
 */
const sendApplicationStatusEmail = async (applicantEmail, applicantName, jobTitle, status) => {
  try {
    const statusColors = {
      'shortlisted': '#28a745',
      'rejected': '#dc3545',
      'interview': '#ffc107',
      'hired': '#28a745'
    };

    const statusMessages = {
      'shortlisted': 'Congratulations! You have been shortlisted for the next round.',
      'rejected': 'Thank you for your interest. We have decided to move forward with other candidates.',
      'interview': 'You have been invited for an interview. Please check your email for details.',
      'hired': 'Great news! You have been selected for this position. Welcome aboard!'
    };

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@huntjob.com',
      to: applicantEmail,
      subject: `Application Update: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Application Status Update</h2>
          <p style="color: #666; line-height: 1.6;">
            Hi ${applicantName},
          </p>
          <p style="color: #666; line-height: 1.6;">
            Thank you for applying to the position of <strong>${jobTitle}</strong>.
          </p>
          <div style="background-color: ${statusColors[status] || '#007bff'}20; border-left: 4px solid ${statusColors[status] || '#007bff'}; padding: 15px; margin: 20px 0; border-radius: 3px;">
            <p style="margin: 0; color: #333; font-weight: bold;">
              ${statusMessages[status] || 'Your application status has been updated.'}
            </p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The HuntJob Team
          </p>
        </div>
      `
    });
    console.log(`Status update email sent to ${applicantEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending application status email:', error);
    return false;
  }
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (userEmail, verificationToken, userName) => {
  try {
    const verificationLink = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@huntjob.com',
      to: userEmail,
      subject: 'Verify Your Email - HuntJob',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p style="color: #666; line-height: 1.6;">
            Hi ${userName},
          </p>
          <p style="color: #666; line-height: 1.6;">
            Please verify your email address to complete your registration.
          </p>
          <div style="margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            This link will expire in 24 hours.
          </p>
        </div>
      `
    });
    console.log(`Verification email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendApplicationNotification,
  sendJobPostingConfirmation,
  sendApplicationStatusEmail,
  sendVerificationEmail
};
