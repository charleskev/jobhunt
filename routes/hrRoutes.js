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
import * as hrController from "../controllers/hrController.js";
import * as applicationController from "../controllers/applicationController.js";
import * as jobController from "../controllers/jobController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { hasRole, isActive, isVerified } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply middleware for all routes
// Allow HR admins (and system admins) to access HR routes
router.use(isAuthenticated, hasRole('hr_admin','sys_admin'), isActive);

// ========== VIEW ROUTES ==========
// Dashboard
router.get("/dashboard", hrController.dashboard);

// Jobs List
router.get("/jobs-list", hrController.jobsList);

// Post New Job - Render job form
router.get("/job-form", (req, res) => {
  res.render("hr/job-form-new", { title: "Create Job Posting", user: req.user });
});

// Post Department Job - Render department job form
router.get("/department-job-form", (req, res) => {
  res.render("hr/department-job-form", { title: "Create Department Job", user: req.user });
});

// Applications List
router.get("/applications-list", hrController.applicationsList);

// Get Applications by Status (Pending, Hired, etc.)
router.get("/applications", hrController.getApplicationsByStatus);

// Application Detail
router.get("/application-detail/:id", hrController.applicationDetail);

// Application Review (alias for /application-detail)
router.get("/application-review/:id", hrController.applicationDetail);

// Reports
router.get("/reports", (req, res) => {
  res.render("hr/reports", { title: "Reports", user: req.user });
});

// Notifications
router.get("/notifications", (req, res) => {
  res.render("hr/notifications", { title: "Notifications", user: req.user });
});

// ========== API ROUTES ==========
// Job creation endpoint
router.post("/api/jobs", isVerified, jobController.createJob);

// Application status management
router.put("/api/applications/:id/status", isVerified, applicationController.updateApplicationStatus);

// Allow form POSTs from the HR UI (HTML forms) for status updates and interview scheduling
router.post("/api/applications/:id/status", isVerified, applicationController.updateApplicationStatus);
router.post("/api/applications/:id/interview", isVerified, applicationController.updateApplicationStatus);

export default router;
