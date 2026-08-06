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
import * as adminController from "../controllers/adminController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { isAdmin, isActive } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply middleware for all routes
router.use(isAuthenticated, isAdmin, isActive);

// ========== VIEW ROUTES ==========
// Dashboard
router.get("/dashboard", adminController.getDashboard);

// Users List
router.get("/users-list", adminController.getUsers);
router.get("/users", adminController.getUsers); // Alias for filtering

// Audit Logs
router.get("/audit-logs", adminController.getAuditLogs);

// Reports
router.get("/reports", adminController.getReports);

// Analytics
router.get("/analytics", adminController.getAnalytics);

// Activity Log
router.get("/activity", adminController.getActivityLog);

// Jobs Management
router.get("/jobs", adminController.getJobs);

// Applications Management
router.get("/applications", adminController.getApplications);

// System Settings
router.get("/system-settings", (req, res) => {
  res.render("admin/system-settings", { title: "System Settings", user: req.user });
});

// Backup & Restore
router.get("/backup", (req, res) => {
  res.render("admin/backup", { title: "Backup & Restore", user: req.user });
});

// Create HR/Manager Account - View
router.get("/create-hr-manager", (req, res) => {
  res.render("admin/create-user", { title: "Create HR/Manager Account", user: req.user });
});

// ========== API ROUTES ==========
// Dashboard and statistics
router.get("/api/dashboard", adminController.getDashboard);
router.get("/api/statistics", adminController.getPlatformStatistics);

// User management - Create HR/Manager
router.post("/api/users/create", adminController.createUser);

// User management - List
router.get("/api/users", adminController.getUsers);
router.put("/api/users/:userId/suspend", adminController.suspendUser);
router.put("/api/users/:userId/activate", adminController.activateUser);
router.put("/api/users/:userId/verify", adminController.verifyUser);
router.delete("/api/users/:userId", adminController.deleteUser);

// Audit logs
router.get("/api/audit-logs", adminController.getAuditLogs);

export default router;
