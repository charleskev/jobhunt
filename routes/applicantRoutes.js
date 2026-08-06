/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import express from "express";
import * as applicantController from "../controllers/applicantController.js";
import * as applicationController from "../controllers/applicationController.js";
import * as notificationController from "../controllers/notificationController.js";
import { isAuthenticated, attachUser } from "../middleware/authMiddleware.js";
import { isJobseeker, isVerified, isActive } from "../middleware/roleMiddleware.js";
import { uploadProfilePicture, uploadDocument, uploadResume, uploadAny } from "../middleware/uploadMiddleware.js";
import { Job } from "../models/index.js";

const router = express.Router();

// Apply middleware for all routes
router.use(isAuthenticated, isJobseeker, isActive);

// ========== VIEW ROUTES ==========
// Dashboard - render view
router.get("/dashboard", (req, res) => {
  const stats = {
    total: 5,
    saved: 12,
    interview: 2,
    offers: 1
  };
  res.render("applicant/dashboard", { title: "Applicant Dashboard", user: req.user, stats });
});

// My Applications
router.get("/my-applications", applicantController.myApplications);

// Saved Jobs
router.get("/saved-jobs", (req, res) => {
  res.render("applicant/saved-jobs", { title: "Saved Jobs", user: req.user });
});

// Notifications
router.get("/notifications", applicantController.notifications);

// Profile - render view
router.get("/profile", (req, res) => {
  res.render("applicant/profile", { title: "My Profile", user: req.user });
});

// Apply for Job - render form
router.get("/apply", (req, res) => {
  // If a jobId query param is present, load job details so form can show job-specific requirements
  const { jobId } = req.query;
  if (jobId) {
    Job.findByPk(jobId)
      .then((job) => {
        if (!job) return res.render("applicant/apply-form", { title: "Apply for Job", user: req.user });
        const requiredDocuments = job.requiredDocuments ? JSON.parse(job.requiredDocuments) : [];
        res.render("applicant/apply-form", {
          title: "Apply for Job",
          user: req.user,
          job,
          requiredDocuments
        });
      })
      .catch((err) => {
        console.error("Error loading job for apply form:", err);
        res.render("applicant/apply-form", { title: "Apply for Job", user: req.user });
      });
    return;
  }

  res.render("applicant/apply-form", { title: "Apply for Job", user: req.user });
});

// ========== API ROUTES ==========
// Profile API routes
router.put("/api/profile", applicantController.updateProfile);
router.post("/api/profile/picture", uploadProfilePicture, applicantController.uploadProfilePicture);

// Job application routes
// Accept any file fields (names will be set by the form's JS to match required document types)
router.post("/api/apply", uploadAny, applicationController.submitApplication);

// Application withdrawal
router.delete("/applications/:id", applicationController.withdrawApplication);

// Saved jobs routes
router.post("/api/saved-jobs/:jobId", applicantController.toggleSaveJob);

// Notification routes
router.get("/api/notifications", notificationController.getNotifications);
router.get("/api/notifications/:id", notificationController.getNotification);
router.put("/api/notifications/:id/read", notificationController.markAsRead);
router.put("/api/notifications/read-all", notificationController.markAllAsRead);
router.delete("/api/notifications/:id", notificationController.deleteNotification);
router.delete("/api/notifications", notificationController.deleteAllNotifications);
router.get("/api/notifications/unread-count", notificationController.getUnreadCount);

export default router;
