/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { Application, Job, User, SavedJob, Notification, Document } from "../models/index.js";
import { Op } from "sequelize";

// ========== DASHBOARD ==========
export const dashboard = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get user info
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }
    });

    // Get application stats
    const stats = {
      total: await Application.count({ where: { userId } }),
      submitted: await Application.count({ where: { userId, status: "submitted" } }),
      underReview: await Application.count({ where: { userId, status: "under_review" } }),
      shortlisted: await Application.count({ where: { userId, status: "shortlisted" } }),
      interview: await Application.count({ where: { userId, status: "interview" } }),
      hired: await Application.count({ where: { userId, status: "hired" } }),
      rejected: await Application.count({ where: { userId, status: "rejected" } })
    };

    // Get recent applications
    const recentApplications = await Application.findAll({
      where: { userId },
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "department", "deadline"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: 5
    });

    // Get saved jobs
    const savedJobs = await SavedJob.findAll({
      where: { userId },
      include: [
        {
          model: Job,
          as: "job",
          where: { status: "open", isActive: true }
        }
      ],
      limit: 3
    });

    // Get notifications
    const notifications = await Notification.findAll({
      where: { userId, isRead: false },
      order: [["createdAt", "DESC"]],
      limit: 5
    });

    res.render("applicant/dashboard", {
      title: "My Dashboard",
      user,
      stats,
      recentApplications,
      savedJobs,
      notifications
    });
  } catch (error) {
    console.error("Applicant dashboard error:", error);
    res.status(500).render("error", { message: "Failed to load dashboard" });
  }
};

// ========== MY APPLICATIONS ==========
export const myApplications = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { status, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (status) where.status = status;

    const applications = await Application.findAndCountAll({
      where,
      attributes: { exclude: ["rating", "hrNotes", "managerNotes", "reviewedBy", "reviewedAt", "interviewDate", "declaration", "jobId", "userId"] },
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "department", "employmentType", "deadline", "municipality", "salaryRange"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    res.render("applicant/my-applications", {
      title: "My Applications",
      applications: applications.rows,
      total: applications.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(applications.count / limit),
      status
    });
  } catch (error) {
    console.error("My applications error:", error);
    res.status(500).render("error", { message: "Failed to load applications" });
  }
};

// ========== SAVED JOBS ==========
export const savedJobs = async (req, res) => {
  try {
    const userId = req.session.userId;

    const saved = await SavedJob.findAll({
      where: { userId },
      include: [
        {
          model: Job,
          as: "job",
          where: { status: "open", isActive: true },
          include: [
            {
              model: User,
              as: "poster",
              attributes: ["firstName", "lastName"]
            }
          ]
        }
      ],
      order: [["savedAt", "DESC"]]
    });

    res.render("applicant/saved-jobs", {
      title: "Saved Jobs",
      savedJobs: saved
    });
  } catch (error) {
    console.error("Saved jobs error:", error);
    res.status(500).render("error", { message: "Failed to load saved jobs" });
  }
};

export const toggleSaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.session.userId;

    const existing = await SavedJob.findOne({ where: { userId, jobId } });

    if (existing) {
      await existing.destroy();
      res.json({ success: true, message: "Job removed from saved", saved: false });
    } else {
      await SavedJob.create({ userId, jobId });
      res.json({ success: true, message: "Job saved successfully", saved: true });
    }
  } catch (error) {
    console.error("Toggle save job error:", error);
    res.status(500).json({ success: false, message: "Failed to save job" });
  }
};

// ========== PROFILE ==========
export const profile = async (req, res) => {
  try {
    const userId = req.session.userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password", "resetToken"] }
    });

    res.render("applicant/profile", {
      title: "My Profile",
      user
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).render("error", { message: "Failed to load profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const {
      firstName,
      lastName,
      middleName,
      contactNumber,
      address,
      barangay,
      dateOfBirth,
      gender
    } = req.body;

    const user = await User.findByPk(userId);
    await user.update({
      firstName,
      lastName,
      middleName,
      contactNumber,
      address,
      barangay,
      dateOfBirth,
      gender
    });

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// ========== PROFILE PICTURE ==========
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findByPk(userId);
    
    // Delete old profile picture if exists
    if (user.profilePhoto) {
      const fs = await import("fs").then(m => m.promises);
      try {
        await fs.unlink(user.profilePhoto);
      } catch (err) {
        console.log("Could not delete old profile picture:", err);
      }
    }

    // Update user with new profile picture path
    await user.update({
      profilePhoto: req.file.path
    });

    res.json({ 
      success: true, 
      message: "Profile picture uploaded successfully",
      profilePhoto: req.file.path
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({ success: false, message: "Failed to upload profile picture" });
  }
};

// ========== NOTIFICATIONS ==========
export const notifications = async (req, res) => {
  try {
    const userId = req.session.userId;

    const notificationList = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 100
    });

    res.render("applicant/notifications", {
      title: "Notifications",
      notifications: notificationList
    });
  } catch (error) {
    console.error("Notifications error:", error);
    res.status(500).render("error", { message: "Failed to load notifications" });
  }
};

export default {
  dashboard,
  myApplications,
  savedJobs,
  toggleSaveJob,
  profile,
  updateProfile,
  uploadProfilePicture,
  notifications
};