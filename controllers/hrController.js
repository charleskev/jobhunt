/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { Job, Application, User, Document, AuditLog, Notification, sequelize } from "../models/index.js";
import { Op } from "sequelize";
import { renderError } from "../utils/errorHandler.js";

// ========== DASHBOARD ==========
export const dashboard = async (req, res) => {
  try {
    const stats = {
      openJobs: await Job.count({ where: { status: "open", isActive: true } }),
      closedJobs: await Job.count({ where: { status: "closed" } }),
      totalApplications: await Application.count(),
      pendingReview: await Application.count({ where: { status: "submitted" } }),
      shortlisted: await Application.count({ where: { status: "shortlisted" } }),
      interviewed: await Application.count({ where: { status: "interview" } }),
      hired: await Application.count({ where: { status: "hired" } })
    };

    // Recent applications
    const recentApplications = await Application.findAll({
      include: [
        { model: Job, as: "job", attributes: ["title", "department"] },
        {
          model: User,
          as: "applicant",
          attributes: ["firstName", "lastName", "email", "profilePhoto"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: 10
    });

    // Top jobs by application count
    const topJobs = await Application.findAll({
      attributes: [
        "jobId",
        [sequelize.fn("COUNT", sequelize.col("jobId")), "applicationCount"]
      ],
      include: [{ model: Job, as: "job", attributes: ["title", "department"] }],
      group: ["jobId"],
      order: [[sequelize.literal("applicationCount"), "DESC"]],
      limit: 5
    });

    // Get recent notifications for this HR user
    const userId = req.session.userId;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 10
    });

    res.render("hr/dashboard", {
      title: "HR Dashboard",
      stats,
      recentApplications,
      topJobs,
      notifications
    });
  } catch (error) {
    console.error("HR dashboard error:", error);
    renderError(res, 500, "Failed to load dashboard");
  }
};

// ========== JOB MANAGEMENT ==========
export const jobsList = async (req, res) => {
  try {
    const { status, department, search, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (department) where.department = department;
    if (search) where.title = { [Op.like]: `%${search}%` };

    const jobs = await Job.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "poster",
          attributes: ["firstName", "lastName"]
        },
        {
          model: Application,
          as: "applications",
          attributes: ["id"],
          required: false
        }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    // Add application count
    const jobsWithCount = jobs.rows.map((job) => ({
      ...job.toJSON(),
      applicationCount: job.applications.length
    }));

    res.render("hr2.0/my-jobs", {
      title: "Manage Jobs",
      jobs: jobsWithCount,
      total: jobs.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(jobs.count / limit),
      status,
      department,
      search
    });
  } catch (error) {
    console.error("Jobs list error:", error);
    res.status(500).render("error", { message: "Failed to load jobs" });
  }
};

export const jobForm = async (req, res) => {
  try {
    const { id } = req.params;
    let job = null;

    if (id) {
      job = await Job.findByPk(id);
      if (!job) {
        return res.status(404).render("404", { message: "Job not found" });
      }
    }

    res.render("hr/job-form-new", {
      title: id ? "Edit Job" : "Create Job",
      job,
      requiredDocuments: job ? JSON.parse(job.requiredDocuments || "[]") : []
    });
  } catch (error) {
    console.error("Job form error:", error);
    res.status(500).render("error", { message: "Failed to load form" });
  }
};

// ========== APPLICATION MANAGEMENT ==========
export const applicationsList = async (req, res) => {
  try {
    const userId = req.session.userId; // Get current HR user
    const { status, jobId, department, search, page = 1 } = req.query;
    const limit = 15;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;

    const jobWhere = {
      postedBy: userId // Only show applications for jobs posted by THIS HR admin
    };
    if (department) jobWhere.municipality = department;

    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get all jobs for filter dropdown
    const jobs = await Job.findAll({
      where: { postedBy: userId },
      attributes: ["id", "title"],
      order: [["title", "ASC"]]
    });

    const applications = await Application.findAndCountAll({
      where,
      include: [
        {
          model: Job,
          as: "job",
          where: jobWhere,
          required: true,
          attributes: ["id", "title", "municipality", "employmentType"]
        },
        {
          model: User,
          as: "applicant",
          where: userWhere,
          attributes: ["id", "firstName", "lastName", "email", "contactNumber", "profilePhoto"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    res.render("hr2.0/applications-list", {
      title: "Applications",
      applications: applications.rows,
      total: applications.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(applications.count / limit),
      status,
      jobId,
      department,
      search,
      jobs
    });
  } catch (error) {
    console.error("Applications list error:", error);
    res.status(500).render("error", { message: "Failed to load applications" });
  }
};

export const applicationDetail = async (req, res) => {
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
      return res.status(404).render("404", { message: "Application not found" });
    }

    res.render("hr2.0/application-review", {
      title: "Application Details",
      application
    });
  } catch (error) {
    console.error("Application detail error:", error);
    res.status(500).render("error", { message: "Failed to load application" });
  }
};

// ========== REPORTS ==========
export const reports = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    // Build date filter
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = end;
      }
    }

    // Get all stats with proper counts
    const allApplications = await Application.findAll({ where });
    
    const stats = {
      totalJobs: await Job.count({ where: { isActive: true } }),
      totalApplications: allApplications.length,
      submitted: allApplications.filter(a => a.status === 'submitted').length,
      underReview: allApplications.filter(a => a.status === 'under_review').length,
      shortlisted: allApplications.filter(a => a.status === 'shortlisted').length,
      interview: allApplications.filter(a => a.status === 'interview').length,
      hired: allApplications.filter(a => a.status === 'hired').length,
      rejected: allApplications.filter(a => a.status === 'rejected').length,
      pendingReview: allApplications.filter(a => a.status === 'submitted' || a.status === 'under_review').length
    };

    // Get job performance data
    const jobs = await Job.findAll({
      attributes: ['id', 'title'],
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Get application counts for each job
    const jobPerformance = [];
    for (const job of jobs) {
      const jobApps = allApplications.filter(a => a.jobId === job.id);
      const hired = jobApps.filter(a => a.status === 'hired').length;
      const shortlisted = jobApps.filter(a => a.status === 'shortlisted').length;
      
      jobPerformance.push({
        id: job.id,
        title: job.title,
        applications: jobApps.length,
        shortlisted: shortlisted,
        hired: hired,
        conversionRate: jobApps.length > 0 ? Math.round((hired / jobApps.length) * 100) : 0
      });
    }

    res.render("hr/reports", {
      title: "Reports & Analytics",
      stats,
      jobs: jobPerformance,
      startDate: startDate || '',
      endDate: endDate || '',
      status: status || ''
    });
  } catch (error) {
    console.error("Reports error:", error);
    res.status(500).render("error", { message: "Failed to generate report" });
  }
};

// ========== USER MANAGEMENT ==========
export const manageUsers = async (req, res) => {
  try {
    const { userType, search, page = 1 } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    const where = { userType: { [Op.in]: ["dept_manager", "hr_admin"] } };
    if (userType) where.userType = userType;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password", "resetToken"] },
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    res.render("hr/users-manage", {
      title: "Manage Users",
      users: users.rows,
      total: users.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(users.count / limit),
      userType,
      search
    });
  } catch (error) {
    console.error("Manage users error:", error);
    res.status(500).render("error", { message: "Failed to load users" });
  }
};

// Get all applications filtered by status (pending, hired, etc.)
export const getApplicationsByStatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findByPk(userId);

    if (!user || (user.userType !== "hr" && user.userType !== "manager")) {
      return res.status(403).render("403", { message: "Access denied" });
    }

    const { page = 1, limit = 20, search = "", status = "" } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { "$applicant.firstName$": { [Op.like]: `%${search}%` } },
        { "$applicant.lastName$": { [Op.like]: `%${search}%` } },
        { "$job.title$": { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filter by status - default to submitted, under_review, shortlisted, or interview
    if (status && ["submitted", "under_review", "shortlisted", "interview", "rejected", "hired"].includes(status)) {
      where.status = status;
    } else {
      where.status = { [Op.in]: ["submitted", "under_review", "shortlisted", "interview"] };
    }

    const applications = await Application.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "applicant",
          attributes: ["id", "firstName", "lastName", "email", "profilePhoto"]
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "department"]
        }
      ],
      offset,
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]]
    });

    res.render("hr2.0/applications-list", {
      title: "Review Applications",
      applications: applications.rows,
      total: applications.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(applications.count / limit),
      search,
      status,
      userType: user.userType
    });
  } catch (error) {
    console.error("Get applications by status error:", error);
    renderError(res, 500, "Failed to load applications");
  }
};

export default {
  dashboard,
  jobsList,
  jobForm,
  applicationsList,
  applicationDetail,
  reports,
  manageUsers,
  getApplicationsByStatus
};