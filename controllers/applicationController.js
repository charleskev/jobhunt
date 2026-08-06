/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { Application, Job, User, Document, Notification, AuditLog } from "../models/index.js";
import { Op } from "sequelize";

// ========== APPLICANT FUNCTIONS ==========
export const submitApplication = async (req, res) => {
  try {
    // jobId may come from params or from a hidden input in the form (body)
    const jobId = req.body.jobId || req.params.jobId;
    const { coverLetter, declaration } = req.body;
    const userId = req.session.userId;

    // Check if job exists and is open
    const job = await Job.findByPk(jobId);
    if (!job || job.status !== "open") {
      return res.status(400).json({ success: false, message: "Job is not available" });
    }

    // Check if already applied
    const existingApp = await Application.findOne({
      where: { jobId, userId }
    });

    if (existingApp) {
      return res.status(400).json({ success: false, message: "You have already applied to this job" });
    }

    // Create application
    const application = await Application.create({
      jobId,
      userId,
      coverLetter,
      declaration: declaration === "on" || declaration === true,
      status: "submitted"
    });

    // Handle file uploads (if any). We accept dynamic field names like "doc_license" or "resume".
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const documents = req.files.map((file) => {
        // Normalize documentType: if fieldname starts with 'doc_' strip it and replace underscores with spaces
        let docType = file.fieldname;
        if (docType && docType.startsWith("doc_")) {
          docType = docType.replace(/^doc_/, "").replace(/_/g, " ");
        }

        return {
          applicationId: application.id,
          documentType: docType,
          fileName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype
        };
      });

      await Document.bulkCreate(documents);
    }

    // Create notification for applicant
    await Notification.create({
      userId,
      title: "Application Submitted",
      message: `Your application for "${job.title}" has been submitted successfully.`,
      type: "application_status"
    });

    // Get the job poster (who created the job)
    const jobPoster = await User.findByPk(job.postedBy);

    // Notify the appropriate person based on who posted the job
    if (jobPoster) {
      let notificationLink = `/hr/applications/${application.id}`;
      if (jobPoster.userType === "dept_manager") {
        notificationLink = `/manager/applications/${application.id}`;
      }

      await Notification.create({
        userId: jobPoster.id,
        title: "New Application Received",
        message: `New application for "${job.title}"`,
        type: "application_status"
      });
    }

    // Also notify other HR admins if job was posted by HR
    if (jobPoster && jobPoster.userType === "hr_admin") {
      const otherHr = await User.findAll({
        where: { userType: "hr_admin", isActive: true, id: { [Op.ne]: jobPoster.id } }
      });

      for (const hr of otherHr) {
        await Notification.create({
          userId: hr.id,
          title: "New Application Received",
          message: `New application for "${job.title}"`,
          type: "application_status"
        });
      }
    }

    // Log action
    await AuditLog.create({
      userId,
      action: "APPLICATION_SUBMITTED",
      entityType: "Application",
      entityId: application.id,
      metadata: { jobId, jobTitle: job.title }
    });

    res.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: application.id
    });
  } catch (error) {
    console.error("Submit application error:", error.message || error);
    console.error("Full error:", error);
    res.status(500).json({ success: false, message: `Failed to submit application: ${error.message || 'Unknown error'}` });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const application = await Application.findOne({
      where: { id, userId }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status !== "submitted") {
      return res.status(400).json({
        success: false,
        message: "Cannot withdraw application at this stage"
      });
    }

    await application.destroy();

    await AuditLog.create({
      userId,
      action: "APPLICATION_WITHDRAWN",
      entityType: "Application",
      entityId: application.id
    });

    res.json({ success: true, message: "Application withdrawn successfully" });
  } catch (error) {
    console.error("Withdraw application error:", error);
    res.status(500).json({ success: false, message: "Failed to withdraw application" });
  }
};

// ========== HR/MANAGER FUNCTIONS ==========
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, interviewDate, rating, feedback } = req.body;
    const userId = req.session.userId;

    const application = await Application.findByPk(id, {
      include: [
        { model: Job, as: "job" },
        { model: User, as: "applicant" }
      ]
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Update application
    application.status = status;
    application.reviewedBy = userId;
    application.reviewedAt = new Date();
    
    // Handle rating and feedback
    if (rating) {
      application.rating = rating;
    }
    if (feedback) {
      application.feedback = feedback;
    }

    const user = await User.findByPk(userId);
    if (user.userType === "hr_admin") {
      application.hrNotes = notes || feedback;
    } else if (user.userType === "dept_manager") {
      application.managerNotes = notes || feedback;
    }

    if (interviewDate) {
      application.interviewDate = new Date(interviewDate);
    }

    await application.save();

    // Notify applicant
    const statusMessages = {
      under_review: "Your application is now under review",
      shortlisted: "Congratulations! You have been shortlisted",
      interview: "You have been scheduled for an interview",
      rejected: "Unfortunately, your application was not successful",
      hired: "You have been successfully hired. Thank you for your patience!"
    };

    await Notification.create({
      userId: application.userId,
      title: "Application Status Update",
      message: `${statusMessages[status]} for "${application.job.title}"`,
      type: "application_status",
      relatedId: application.id,
      relatedType: "Application",
      metadata: { applicationId: application.id, jobId: application.jobId, status }
    });

    // Notify HR admin about the action
    const hrStatusNotificationMessages = {
      under_review: `Marked "${application.applicant.firstName} ${application.applicant.lastName}" as under review for ${application.job.title}`,
      shortlisted: `Shortlisted "${application.applicant.firstName} ${application.applicant.lastName}" for ${application.job.title}`,
      interview: `Scheduled interview with "${application.applicant.firstName} ${application.applicant.lastName}" for ${application.job.title}`,
      rejected: `Rejected application from "${application.applicant.firstName} ${application.applicant.lastName}" for ${application.job.title}`,
      hired: `Successfully hired "${application.applicant.firstName} ${application.applicant.lastName}" for ${application.job.title}`
    };

    await Notification.create({
      userId: userId,
      title: "Application Action Completed",
      message: hrStatusNotificationMessages[status],
      type: "application_status",
      relatedId: application.id,
      relatedType: "Application",
      metadata: { applicationId: application.id, jobId: application.jobId, status, applicantName: `${application.applicant.firstName} ${application.applicant.lastName}` }
    });

    // Log action
    await AuditLog.create({
      userId,
      action: "APPLICATION_STATUS_UPDATED",
      entityType: "Application",
      entityId: application.id,
      metadata: { status, notes }
    });

    res.json({ success: true, message: "Application status updated successfully" });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

export const rateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.session.userId;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    application.rating = rating;
    application.managerNotes = feedback;
    await application.save();

    await AuditLog.create({
      userId,
      action: "APPLICATION_RATED",
      entityType: "Application",
      entityId: application.id,
      metadata: { rating, feedback }
    });

    res.json({ success: true, message: "Application rated successfully" });
  } catch (error) {
    console.error("Rate application error:", error);
    res.status(500).json({ success: false, message: "Failed to rate application" });
  }
};

export const getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: Job,
          as: "job",
          include: [{ model: User, as: "poster", attributes: ["firstName", "lastName"] }]
        },
        {
          model: User,
          as: "applicant",
          attributes: { exclude: ["password", "resetToken"] }
        },
        {
          model: Document,
          as: "documents"
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    console.error("Get application details error:", error);
    res.status(500).json({ success: false, message: "Failed to get application details" });
  }
};

export default {
  submitApplication,
  withdrawApplication,
  updateApplicationStatus,
  rateApplication,
  getApplicationDetails
};