/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

import { Job, User, Application, SavedJob, AuditLog, sequelize } from "../models/index.js";
import { Op } from "sequelize";
import { renderError } from "../utils/errorHandler.js";

// ========== PUBLIC VIEWS ==========
export const listJobs = async (req, res) => {
  try {
    const { search, municipality, department, type, page = 1, jobType = "all" } = req.query;
    const limit = 12;
    const offset = (page - 1) * limit;

    const where = { status: "open", isActive: true };

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filter by job type (Municipality jobs vs Department jobs)
    if (jobType === "municipality" || jobType === "hr") {
      // Jobs with municipality category
      where.category = "municipality";
      // Filter by municipality only when municipality filter is selected
      if (municipality) {
        where.municipality = municipality;
      }
    } else if (jobType === "department" || jobType === "manager") {
      // Jobs with department category
      where.category = "department";
      // Filter by department only when department filter is selected
      if (department) {
        where.department = department;
      }
    }
    // If jobType is "all", show both types (no category filter)
    // In this case, municipality and department filters are not applied
    
    if (type) where.employmentType = type;

    let jobs = await Job.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "poster",
          attributes: ["firstName", "lastName", "userType", "department"]
        }
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]]
    });

    // If no jobs exist, auto-seed two example jobs so applicants can try the flow locally
    if (!jobs || jobs.count === 0) {
      try {
        const admin = await User.findOne({ where: { email: 'admin@gmail.com' } });
        const posterId = admin ? admin.id : null;

        const seedJobs = [
          {
            title: 'Registered Nurse',
            department: 'Health Services',
            description: 'Provide nursing care to patients in municipal health centers and clinics.',
            requirements: '<ul><li>BS Nursing degree</li><li>At least 1 year experience preferred</li></ul>',
            salaryRange: '20,000 - 30,000 PHP',
            employmentType: 'Full-time',
            positions: 3,
            deadline: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
            requiredDocuments: JSON.stringify(['Resume', 'Nursing License', 'Diploma/Transcript', 'NBI Clearance']),
            postedBy: posterId,
            status: 'open',
            isActive: true
          },
          {
            title: 'Driver (Heavy/Light Vehicle)',
            department: 'Logistics',
            description: 'Drive municipal vehicles for official duties; perform vehicle inspections and basic maintenance.',
            requirements: '<ul><li>High school diploma</li><li>Valid Driver\'s License</li></ul>',
            salaryRange: '12,000 - 18,000 PHP',
            employmentType: 'Full-time',
            positions: 2,
            deadline: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000),
            requiredDocuments: JSON.stringify(['Resume', "Valid Driver's License", 'Medical Certificate', 'NBI Clearance']),
            postedBy: posterId,
            status: 'open',
            isActive: true
          }
        ];

        await Job.bulkCreate(seedJobs);

        jobs = await Job.findAndCountAll({
          where,
          include: [
            {
              model: User,
              as: "poster",
              attributes: ["firstName", "lastName"]
            }
          ],
          limit,
          offset,
          order: [["createdAt", "DESC"]]
        });
      } catch (seedErr) {
        console.error('Error seeding jobs:', seedErr);
      }
    }

    // Get unique departments for filter (from manager jobs)
    const departments = await sequelize.query(
      `SELECT DISTINCT j.department FROM Jobs j 
       INNER JOIN Users u ON j.postedBy = u.id 
       WHERE j.status = 'open' AND j.isActive = true AND u.userType = 'dept_manager'`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // Get unique municipalities for filter (from HR jobs)
    const municipalities = await sequelize.query(
      `SELECT DISTINCT j.municipality FROM Jobs j 
       INNER JOIN Users u ON j.postedBy = u.id 
       WHERE j.status = 'open' AND j.isActive = true AND u.userType = 'hr_admin' AND j.municipality IS NOT NULL`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.render("jobs", {
      title: "Browse Jobs",
      jobs: jobs.rows,
      total: jobs.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(jobs.count / limit),
      departments: departments.map((d) => d.department).filter(d => d),
      municipalities: municipalities.map((m) => m.municipality).filter(m => m),
      search,
      municipality,
      department,
      type,
      jobType,
      user: req.user
    });
  } catch (error) {
    console.error("List jobs error:", error);
    renderError(res, 500, "Failed to load jobs");
  }
};

export const viewJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      include: [
        {
          model: User,
          as: "poster",
          attributes: ["firstName", "lastName", "email"]
        }
      ]
    });

    if (!job || job.status !== "open" || !job.isActive) {
      return res.status(404).render("404", { message: "Job not found" });
    }

    // Increment view count
    job.viewCount += 1;
    await job.save();

    // Check if user already applied
    let userHasApplied = false;
    let isSaved = false;

    if (req.session.userId) {
      userHasApplied = await Application.findOne({
        where: { jobId: job.id, userId: req.session.userId }
      });

      isSaved = await SavedJob.findOne({
        where: { jobId: job.id, userId: req.session.userId }
      });
    }

    res.render("job-detail", {
      title: job.title,
      job,
      userHasApplied: !!userHasApplied,
      isSaved: !!isSaved,
      requiredDocuments: job.requiredDocuments ? JSON.parse(job.requiredDocuments) : []
    });
  } catch (error) {
    console.error("View job error:", error);
    renderError(res, 500, "Failed to load job details");
  }
};

// ========== HR FUNCTIONS ==========
export const createJob = async (req, res) => {
  try {
    const {
      title,
      municipality,
      department,
      description,
      requirements,
      salaryRange,
      employmentType,
      positions,
      deadline,
      requiredDocuments,
      category
    } = req.body;

    const user = await User.findByPk(req.session.userId);

    // For HR admins: use municipality, for managers: use department
    let jobDept = department;
    let jobMunicipality = municipality;

    if (user.userType === "hr_admin") {
      jobDept = municipality || "General";
      jobMunicipality = municipality;
    } else if (user.userType === "dept_manager") {
      jobDept = user.department;
    }

    const job = await Job.create({
      title,
      department: jobDept,
      municipality: jobMunicipality,
      description,
      requirements,
      salaryRange,
      employmentType,
      positions: positions || 1,
      deadline,
      requiredDocuments: typeof requiredDocuments === 'string' 
        ? requiredDocuments 
        : JSON.stringify(requiredDocuments || []),
      category: category || (user.userType === "hr_admin" ? "municipality" : "department"),
      postedBy: req.session.userId,
      status: "open",
      isActive: true
    });

    await AuditLog.create({
      userId: req.session.userId,
      action: "JOB_CREATED",
      entityType: "Job",
      entityId: job.id,
      metadata: { title: job.title }
    });

    // Redirect based on user type
    if (user.userType === "hr_admin") {
      res.redirect("/hr/jobs-list");
    } else if (user.userType === "dept_manager") {
      res.redirect("/manager/my-jobs");
    } else {
      res.redirect("/jobs");
    }
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ success: false, message: "Failed to create job" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const oldData = { ...job.toJSON() };
    await job.update(req.body);

    await AuditLog.create({
      userId: req.session.userId,
      action: "JOB_UPDATED",
      entityType: "Job",
      entityId: job.id,
      metadata: { before: oldData, after: job.toJSON() }
    });

    res.json({ success: true, message: "Job updated successfully" });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ success: false, message: "Failed to update job" });
  }
};

export const closeJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    job.status = "closed";
    await job.save();

    await AuditLog.create({
      userId: req.session.userId,
      action: "JOB_CLOSED",
      entityType: "Job",
      entityId: job.id
    });

    res.json({ success: true, message: "Job closed successfully" });
  } catch (rror) {
    console.error("Close job error:", error);
    res.status(500).json({ success: false, message: "Failed to close job" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    await job.update({ isActive: false });

    await AuditLog.create({
      userId: req.session.userId,
      action: "JOB_DELETED",
      entityType: "Job",
      entityId: job.id,
      metadata: { title: job.title }
    });

    res.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ success: false, message: "Failed to delete job" });
  }
};

export default {
  listJobs,
  viewJob,
  createJob,
  updateJob,
  closeJob,
  deleteJob
};