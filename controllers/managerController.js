/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { Application, Job, User, Document, Notification } from "../models/index.js";
import { Op } from "sequelize";
import { renderError } from "../utils/errorHandler.js";

// ========== DASHBOARD ==========
export const dashboard = async (req, res) => {
  try {
    const userId = req.session.userId;
    const manager = await User.findByPk(userId);

    // Get stats for ALL applications and jobs (HR 2.0 view)
    const stats = {
      openJobs: await Job.count({
        where: { status: "open", isActive: true }
      }),
      totalApplications: await Application.count(),
      pendingReview: await Application.count({
        where: { status: { [Op.in]: ["submitted", "under_review"] } }
      }),
      shortlisted: await Application.count({
        where: { status: "shortlisted" }
      }),
      interview: await Application.count({
        where: { status: "interview" }
      }),
      hired: await Application.count({
        where: { status: "hired" }
      }),
      rejected: await Application.count({
        where: { status: "rejected" }
      })
    };

    // Recent applications from all departments
    const recentApplications = await Application.findAll({
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "department"]
        },
        {
          model: User,
          as: "applicant",
          attributes: ["firstName", "lastName", "email", "profilePhoto"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: 10
    }).then(apps => 
      apps.map(app => {
        const appData = app.toJSON();
        // Add User as an alias for applicant for template compatibility
        appData.User = appData.applicant;
        appData.Job = appData.job;
        return appData;
      })
    );

    // Recent jobs from all departments
    const recentJobs = await Job.findAll({
      attributes: ["id", "title", "department"],
      order: [["createdAt", "DESC"]],
      limit: 10
    }).then(async jobs => {
      const jobsWithCount = await Promise.all(
        jobs.map(async (job) => {
          const count = await Application.count({ where: { jobId: job.id } });
          return {
            ...job.toJSON(),
            applicationsCount: count
          };
        })
      );
      return jobsWithCount;
    });

    // Recent notifications for this manager
    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 10
    });

    res.render("hr2.0/dashboard", {
      title: "HR Dashboard 2.0",
      stats,
      recentApplications,
      topJobs: recentJobs,
      notifications
    });
  } catch (error) {
    console.error("Manager dashboard error:", error);
    renderError(res, 500, "Failed to load dashboard");
  }
};

// ========== APPLICATIONS ==========
export const applicationsList = async (req, res) => {
  try {
    const { status, jobId, page = 1 } = req.query;
    const limit = 15;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;

    const applications = await Application.findAndCountAll({
      where,
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "department", "employmentType"],
          required: true
        },
        {
          model: User,
          as: "applicant",
          attributes: ["id", "firstName", "lastName", "email", "contactNumber"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    res.render("hr2.0/applications-list", {
      title: "All Applications",
      applications: applications.rows,
      totalApplications: applications.count,
      page,
      totalPages: Math.ceil(applications.count / limit),
      pages: Array.from({length: Math.ceil(applications.count / limit)}, (_, i) => i + 1),
      status,
      jobId
    });
  } catch (error) {
    console.error("Manager applications list error:", error);
    res.status(500).render("error", { message: "Failed to load applications" });
  }
};

// ========== REVIEW APPLICATION ==========
export const reviewApplication = async (req, res) => {
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
      title: "Review Application",
      application
    });
  } catch (error) {
    console.error("Review application error:", error);
    res.status(500).render("error", { message: "Failed to load application" });
  }
};

// ========== MY JOBS ==========
export const myJobs = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(403).render("error", { message: "User not found" });
    }

    const { status, page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Show ALL jobs for HR 2.0 (no department filter, show all statuses)
    const where = {};
    if (status) where.status = status;

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
          attributes: ["id", "status"],
          required: false
        }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    // Add application counts
    const jobsWithStats = jobs.rows.map((job) => {
      const applications = job.applications || [];
      return {
        ...job.toJSON(),
        applicationCount: applications.length,
        pendingCount: applications.filter((a) => a.status === "submitted").length,
        shortlistedCount: applications.filter((a) => a.status === "shortlisted").length
      };
    });

    res.render("hr2.0/my-jobs", {
      title: "All Jobs",
      jobs: jobsWithStats,
      total: jobs.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(jobs.count / limit),
      status
    });
  } catch (error) {
    console.error("My jobs error:", error);
    res.status(500).render("error", { message: "Failed to load jobs" });
  }
};

// ========== REPORTS ==========
export const reports = async (req, res) => {
  try {
    const userId = req.session.userId;
    const manager = await User.findByPk(userId);

    if (!manager || !manager.department) {
      return res.status(403).render("error", { message: "Department not assigned" });
    }

    // Get department jobs
    const allJobs = await Job.findAll({
      where: { department: manager.department },
      attributes: ["id", "title", "status", "createdAt"]
    });

    // Get all applications for department jobs
    const allApplications = await Application.findAll({
      include: [
        {
          model: Job,
          as: "job",
          where: { department: manager.department },
          required: true,
          attributes: ["id", "title"]
        },
        {
          model: User,
          as: "applicant",
          attributes: ["id", "firstName", "lastName", "email"]
        }
      ]
    });

    // Calculate statistics
    const stats = {
      totalJobs: allJobs.length,
      openJobs: allJobs.filter(j => j.status === "open").length,
      closedJobs: allJobs.filter(j => j.status === "closed").length,
      totalApplications: allApplications.length,
      submittedApps: allApplications.filter(a => a.status === "submitted").length,
      underReviewApps: allApplications.filter(a => a.status === "under_review").length,
      shortlistedApps: allApplications.filter(a => a.status === "shortlisted").length,
      interviewApps: allApplications.filter(a => a.status === "interview").length,
      hiredApps: allApplications.filter(a => a.status === "hired").length,
      rejectedApps: allApplications.filter(a => a.status === "rejected").length
    };

    // Application breakdown by status
    const statusBreakdown = [
      { status: "Submitted", count: stats.submittedApps, percentage: (stats.submittedApps / stats.totalApplications * 100).toFixed(1) },
      { status: "Under Review", count: stats.underReviewApps, percentage: (stats.underReviewApps / stats.totalApplications * 100).toFixed(1) },
      { status: "Shortlisted", count: stats.shortlistedApps, percentage: (stats.shortlistedApps / stats.totalApplications * 100).toFixed(1) },
      { status: "Interview", count: stats.interviewApps, percentage: (stats.interviewApps / stats.totalApplications * 100).toFixed(1) },
      { status: "Hired", count: stats.hiredApps, percentage: (stats.hiredApps / stats.totalApplications * 100).toFixed(1) },
      { status: "Rejected", count: stats.rejectedApps, percentage: (stats.rejectedApps / stats.totalApplications * 100).toFixed(1) }
    ];

    // Top jobs by application count
    const topJobs = allApplications.reduce((acc, app) => {
      const existing = acc.find(j => j.jobId === app.jobId);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ jobId: app.jobId, jobTitle: app.job.title, count: 1 });
      }
      return acc;
    }, []).sort((a, b) => b.count - a.count).slice(0, 5);

    res.render("hr2.0/reports", {
      title: "Department Reports",
      stats,
      statusBreakdown,
      topJobs,
      department: manager.department
    });
  } catch (error) {
    console.error("Reports error:", error);
    renderError(res, 500, "Failed to load reports");
  }
};

// Get all applications filtered by status (pending, hired, etc.)
export const getApplicationsByStatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findByPk(userId);

    if (!user || user.userType !== "manager") {
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

    // Only show applications for jobs in their department
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
          attributes: ["id", "title", "department"],
          where: { department: user.department },
          required: true
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
  applicationsList,
  reviewApplication,
  myJobs,
  reports,
  getApplicationsByStatus
};