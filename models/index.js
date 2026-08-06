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

import { sequelize } from "./db.js";
import User from "./User.js";
import Job from "./Job.js";
import Application from "./Application.js";
import Document from "./Document.js";
import SavedJob from "./SavedJob.js";
import Notification from "./Notification.js";
import AuditLog from "./AuditLog.js";

// Define associations
// User associations
User.hasMany(Job, {
  foreignKey: "employerId",
  as: "postedJobs"
});

User.hasMany(Application, {
  foreignKey: "userId",
  as: "applications"
});

User.hasMany(Document, {
  foreignKey: "userId",
  as: "documents"
});

User.hasMany(SavedJob, {
  foreignKey: "userId",
  as: "savedJobs"
});

User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications"
});

User.hasMany(AuditLog, {
  foreignKey: "userId",
  as: "auditLogs"
});

// Job associations
Job.belongsTo(User, {
  foreignKey: "employerId",
  as: "employer"
});

Job.belongsTo(User, {
  foreignKey: "postedBy",
  as: "poster"
});

Job.hasMany(Application, {
  foreignKey: "jobId",
  as: "applications"
});

Job.hasMany(SavedJob, {
  foreignKey: "jobId",
  as: "savedBy"
});

// Application associations
Application.belongsTo(User, {
  foreignKey: "userId",
  as: "applicant"
});

Application.belongsTo(Job, {
  foreignKey: "jobId",
  as: "job"
});

Application.hasMany(Document, {
  foreignKey: "applicationId",
  as: "documents"
});

// SavedJob associations
SavedJob.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

SavedJob.belongsTo(Job, {
  foreignKey: "jobId",
  as: "job"
});

// Document associations
Document.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

// Notification associations
Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

// AuditLog associations
AuditLog.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

export {
  sequelize,
  User,
  Job,
  Application,
  Document,
  SavedJob,
  Notification,
  AuditLog
};
