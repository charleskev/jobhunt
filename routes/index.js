
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
import { homePage } from "../controllers/homeController.js";
import authRoutes from "./authRoutes.js";
import publicRoutes from "./publicRoutes.js";
import applicantRoutes from "./applicantRoutes.js";
import hrRoutes from "./hrRoutes.js";
import managerRoutes from "./managerRoutes.js";
import hr2Routes from "./hr2Routes.js";
import adminRoutes from "./adminRoutes.js";
import { attachUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Attach user to all requests
router.use(attachUser);

// ========== PUBLIC ROUTES ==========
// Home page
router.get("/", homePage);

// Auth routes (login, register, forgot password, etc.)
router.use("/auth", authRoutes);

// Public routes (job listings, etc.) - mounted at root level
router.use(publicRoutes);

// ========== ROLE-BASED ROUTES ==========
// Applicant/Jobseeker routes
router.use("/applicant", applicantRoutes);

// HR routes
router.use("/hr", hrRoutes);

// HR 2.0 routes (unified manager/HR portal)
router.use("/hr2.0", hr2Routes);

// Manager/Employer routes (legacy, now redirects to hr2.0)
router.use("/manager", managerRoutes);

// Admin routes
router.use("/admin", adminRoutes);

export default router;
