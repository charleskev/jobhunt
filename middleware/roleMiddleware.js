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

import { User } from "../models/index.js";

// Check if user has specific role
export const hasRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const user = await User.findByPk(req.session.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (!allowedRoles.includes(user.userType)) {
        return res.status(403).json({ success: false, message: "Access denied - insufficient permissions" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

// Jobseeker only
export const isJobseeker = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      // If requesting HTML page, redirect to login; if API, return JSON
      if (req.accepts && req.accepts('html')) {
        return res.redirect('/auth/login');
      }
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      if (req.accepts && req.accepts('html')) {
        return res.redirect('/auth/login');
      }
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Accept both legacy `applicant` and canonical `jobseeker` values
    if (!["jobseeker", "applicant"].includes(user.userType)) {
      if (req.accepts && req.accepts('html')) {
        return res.status(403).render('error', { message: "This resource is for jobseekers/applicants only" });
      }
      return res.status(403).json({ success: false, message: "This resource is for jobseekers only" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (req.accepts && req.accepts('html')) {
      return res.status(500).render('error', { message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer only
export const isEmployer = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.userType !== "employer") {
      return res.status(403).json({ success: false, message: "This resource is for employers only" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin only
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.userType !== "sys_admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Employer or Admin
export const isEmployerOrAdmin = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.userType !== "employer" && user.userType !== "sys_admin") {
      return res.status(403).json({ success: false, message: "Employer or admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if user is verified
export const isVerified = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your account first" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if user is active
export const isActive = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been suspended" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  hasRole,
  isJobseeker,
  isEmployer,
  isAdmin,
  isEmployerOrAdmin,
  isVerified,
  isActive
};
