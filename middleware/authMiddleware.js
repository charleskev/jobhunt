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

// Check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    // If the request expects HTML (browser), redirect to login page
    if (req.accepts && req.accepts('html')) {
      return res.redirect('/auth/login');
    }
    // For API / JSON requests, return 401 JSON
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

// Check if user is authenticated (for page rendering)
export const isAuthenticatedPage = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }
  next();
};

// Attach user data to request
export const attachUser = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findByPk(req.session.userId, {
        attributes: { exclude: ["password"] }
      });
      if (user) {
        req.user = user;
        res.locals.user = user;
      }
    }
  } catch (error) {
    console.error("Error attaching user:", error);
  }
  next();
};

// Check if user is NOT authenticated
export const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect("/");
  }
  next();
};

// Optional authentication - doesn't require auth but attaches user if available
export const optionalAuth = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findByPk(req.session.userId, {
        attributes: { exclude: ["password"] }
      });
      req.user = user;
      res.locals.user = user;
    } catch (error) {
      console.error("Error attaching user:", error);
    }
  }
  next();
};

export default {
  isAuthenticated,
  isAuthenticatedPage,
  attachUser,
  isNotAuthenticated,
  optionalAuth
};
