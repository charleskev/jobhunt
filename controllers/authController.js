/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import bcrypt from "bcrypt";
import crypto from "crypto";
import { User, AuditLog, sequelize } from "../models/index.js";
import { Op } from "sequelize";
import { renderError } from "../utils/errorHandler.js";

// Initialize database (don't force reset tables - this deletes all data!)
await sequelize.sync();

// ========== RENDER PAGES ==========
export const loginPage = (req, res) => {
  if (req.session.userId) {
    return res.redirect(getDashboardByRole(req.session.userType, req.session.userEmail));
  }
  res.render("login", { title: "Login", error: null });
};

export const registerPage = (req, res) => {
  if (req.session.userId) {
    return res.redirect(getDashboardByRole(req.session.userType, req.session.userEmail));
  }
  res.render("register", { title: "Register", error: null });
};

export const forgotPasswordPage = (req, res) => {
  res.render("forgotpassword", { title: "Forgot Password", error: null });
};

// ========== AUTHENTICATION ==========
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, contactNumber } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.render("register", {
        title: "Register",
        error: "All fields are required"
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("register", {
        title: "Register",
        error: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
      userType: "applicant",
      isActive: true,
      isVerified: false
    });

    // Log the registration
    await AuditLog.create({
      userId: user.id,
      action: "USER_REGISTERED",
      entityType: "User",
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    // Auto login
    req.session.userId = user.id;
    req.session.userType = user.userType;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.render("register", {
          title: "Register",
          error: "Login failed after registration. Please try logging in manually."
        });
      }
      res.redirect("/applicant/dashboard");
    });
  } catch (error) {
    console.error("Register error:", error);
    res.render("register", {
      title: "Register",
      error: "Registration failed. Please try again."
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.render("login", {
        title: "Login",
        error: "Email and password are required"
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("User not found for email:", email);
      return res.render("login", {
        title: "Login",
        error: "Invalid email or password"
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log("Account inactive for user:", email);
      return res.render("login", {
        title: "Login",
        error: "Your account has been suspended. Contact admin."
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Password mismatch for user:", email);
      return res.render("login", {
        title: "Login",
        error: "Invalid email or password"
      });
    }

    console.log("Login successful for user:", email);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log the login
    await AuditLog.create({
      userId: user.id,
      action: "USER_LOGIN",
      entityType: "User",
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    // Set session
    // Normalize and set session userType to ensure consistent redirects
    const normalizedType = normalizeUserType(user.userType);
    req.session.userId = user.id;
    req.session.userType = normalizedType;
    req.session.userEmail = user.email;

    // Compute redirect target and save session
    const target = getDashboardByRole(normalizedType, user.email) || "/";
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.render("login", {
          title: "Login",
          error: "Login failed. Please try again."
        });
      }
      return res.redirect(target);
    });
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", {
      title: "Login",
      error: "Login failed. Please try again."
    });
  }
};

export const logoutUser = async (req, res) => {
  const userId = req.session.userId;

  if (userId) {
    await AuditLog.create({
      userId,
      action: "USER_LOGOUT",
      entityType: "User",
      entityId: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });
  }

  req.session.destroy();
  res.redirect("/");
};

// ========== PASSWORD RESET ==========
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render("forgotpassword", {
        title: "Forgot Password",
        message: "If email exists, reset link will be sent."
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // TODO: Send email with reset link
    // const resetLink = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

    await AuditLog.create({
      userId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      entityType: "User",
      entityId: user.id
    });

    res.render("forgotpassword", {
      title: "Forgot Password",
      message: "Password reset link sent to your email."
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.render("forgotpassword", {
      title: "Forgot Password",
      error: "Failed to process request."
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return renderError(res, 400, "Invalid or expired reset token");
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    await AuditLog.create({
      userId: user.id,
      action: "PASSWORD_RESET_COMPLETED",
      entityType: "User",
      entityId: user.id
    });

    res.redirect("/auth/login");
  } catch (error) {
    console.error("Reset password error:", error);
    renderError(res, 500, "Failed to reset password");
  }
};

// ========== HELPERS ==========
function getDashboardByRole(userType, email) {
  const dashboards = {
    applicant: "/applicant/dashboard",
    hr_admin: "/hr2.0/dashboard",
    dept_manager: "/manager/dashboard",
    sys_admin: "/admin/dashboard"
  };

  if (userType === "hr_admin") {
    if (email === "hr1@huntjob.com") return "/hr/dashboard";
    if (email === "hr2@huntjob.com") return "/hr2.0/dashboard";
  }

  return dashboards[userType] || "/";
}

// Normalize possible userType variants to canonical values
function normalizeUserType(userType) {
  if (!userType) return 'applicant';
  const t = String(userType).toLowerCase();
  if (t === 'hr' || t === 'hr_admin' || t === 'hr-admin') return 'hr_admin';
  if (t === 'dept_manager' || t === 'dept-manager' || t === 'manager' || t === 'dept') return 'dept_manager';
  if (t === 'sys_admin' || t === 'sys-admin' || t === 'admin' || t === 'system_admin') return 'sys_admin';
  if (t === 'employer') return 'employer';
  if (t === 'jobseeker' || t === 'applicant') return 'applicant';
  return t;
}

export default {
  loginPage,
  registerPage,
  forgotPasswordPage,
  registerUser,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword
};