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
import * as managerController from "../controllers/managerController.js";
import * as applicationController from "../controllers/applicationController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { hasRole, isActive, isVerified } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply middleware for all routes
// Allow department managers, HR admins (and system admins) to access hr2.0 routes
router.use(isAuthenticated, hasRole('dept_manager', 'hr_admin', 'sys_admin'), isActive);

// ========== VIEW ROUTES ==========
// Dashboard - HR 2.0 Dashboard
router.get("/dashboard", managerController.dashboard);

// My Jobs - All jobs across organization
router.get("/my-jobs", managerController.myJobs);

// Applications List - Shows all applications (HR 2.0 view)
router.get("/applications-list", managerController.applicationsList);

// Application Review - Shows application details
router.get("/application-review/:id", managerController.reviewApplication);

// ========== API ROUTES ==========
// Application status management
router.put("/api/applications/:id/status", isVerified, applicationController.updateApplicationStatus);
router.post("/api/applications/:id/status", isVerified, applicationController.updateApplicationStatus);
router.post("/api/applications/:id/interview", isVerified, applicationController.updateApplicationStatus);

export default router;
