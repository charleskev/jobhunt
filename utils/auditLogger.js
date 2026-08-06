const { AuditLog } = require('../models');

/**
 * Log audit event
 */
const logAudit = async (userId, action, entityType, entityId, changes = null, ipAddress = null, status = 'success') => {
  try {
    const auditLog = await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      changes: changes ? JSON.stringify(changes) : null,
      ipAddress,
      status,
      timestamp: new Date()
    });

    console.log(`Audit logged: ${action} on ${entityType} by user ${userId}`);
    return auditLog;
  } catch (error) {
    console.error('Error logging audit:', error);
    return null;
  }
};

/**
 * Get user's audit history
 */
const getUserAuditHistory = async (userId, limit = 50, offset = 0) => {
  try {
    const logs = await AuditLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    return logs;
  } catch (error) {
    console.error('Error retrieving user audit history:', error);
    return [];
  }
};

/**
 * Get audit history for an entity
 */
const getEntityAuditHistory = async (entityType, entityId, limit = 50, offset = 0) => {
  try {
    const logs = await AuditLog.find({ entityType, entityId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    return logs;
  } catch (error) {
    console.error('Error retrieving entity audit history:', error);
    return [];
  }
};

/**
 * Get all audit logs with filters
 */
const getAllAuditLogs = async (filters = {}, limit = 50, offset = 0) => {
  try {
    const query = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.status) query.status = filters.status;
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const total = await AuditLog.countDocuments(query);

    return { logs, total };
  } catch (error) {
    console.error('Error retrieving audit logs:', error);
    return { logs: [], total: 0 };
  }
};

/**
 * Log user login
 */
const logUserLogin = async (userId, ipAddress) => {
  return logAudit(userId, 'LOGIN', 'USER', userId, null, ipAddress, 'success');
};

/**
 * Log user logout
 */
const logUserLogout = async (userId, ipAddress) => {
  return logAudit(userId, 'LOGOUT', 'USER', userId, null, ipAddress, 'success');
};

/**
 * Log user registration
 */
const logUserRegistration = async (userId, userData, ipAddress) => {
  return logAudit(userId, 'REGISTER', 'USER', userId, userData, ipAddress, 'success');
};

/**
 * Log user profile update
 */
const logProfileUpdate = async (userId, changes, ipAddress) => {
  return logAudit(userId, 'UPDATE_PROFILE', 'USER', userId, changes, ipAddress, 'success');
};

/**
 * Log password change
 */
const logPasswordChange = async (userId, ipAddress) => {
  return logAudit(userId, 'CHANGE_PASSWORD', 'USER', userId, null, ipAddress, 'success');
};

/**
 * Log job posting
 */
const logJobPosting = async (userId, jobId, jobData, ipAddress) => {
  return logAudit(userId, 'CREATE_JOB', 'JOB', jobId, jobData, ipAddress, 'success');
};

/**
 * Log job update
 */
const logJobUpdate = async (userId, jobId, changes, ipAddress) => {
  return logAudit(userId, 'UPDATE_JOB', 'JOB', jobId, changes, ipAddress, 'success');
};

/**
 * Log job deletion
 */
const logJobDeletion = async (userId, jobId, ipAddress) => {
  return logAudit(userId, 'DELETE_JOB', 'JOB', jobId, null, ipAddress, 'success');
};

/**
 * Log job application
 */
const logJobApplication = async (userId, applicationId, applicationData, ipAddress) => {
  return logAudit(userId, 'APPLY_JOB', 'APPLICATION', applicationId, applicationData, ipAddress, 'success');
};

/**
 * Log application status change
 */
const logApplicationStatusChange = async (userId, applicationId, oldStatus, newStatus, ipAddress) => {
  const changes = { oldStatus, newStatus };
  return logAudit(userId, 'UPDATE_APPLICATION', 'APPLICATION', applicationId, changes, ipAddress, 'success');
};

/**
 * Log user role change
 */
const logRoleChange = async (userId, targetUserId, oldRole, newRole, ipAddress) => {
  const changes = { userId: targetUserId, oldRole, newRole };
  return logAudit(userId, 'CHANGE_ROLE', 'USER', targetUserId, changes, ipAddress, 'success');
};

/**
 * Log file upload
 */
const logFileUpload = async (userId, fileName, fileType, ipAddress) => {
  const changes = { fileName, fileType };
  return logAudit(userId, 'UPLOAD_FILE', 'FILE', fileName, changes, ipAddress, 'success');
};

/**
 * Log file deletion
 */
const logFileDeletion = async (userId, fileName, fileType, ipAddress) => {
  const changes = { fileName, fileType };
  return logAudit(userId, 'DELETE_FILE', 'FILE', fileName, changes, ipAddress, 'success');
};

/**
 * Log export action
 */
const logExport = async (userId, exportType, filtersCriteria, ipAddress) => {
  const changes = { exportType, filtersCriteria };
  return logAudit(userId, 'EXPORT_DATA', 'EXPORT', `${exportType}-${Date.now()}`, changes, ipAddress, 'success');
};

/**
 * Log failed action
 */
const logFailedAction = async (userId, action, entityType, entityId, reason, ipAddress) => {
  return logAudit(userId, action, entityType, entityId, { reason }, ipAddress, 'failed');
};

/**
 * Clear old audit logs (older than specified days)
 */
const clearOldAuditLogs = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    console.log(`Deleted ${result.deletedCount} old audit logs`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error clearing old audit logs:', error);
    return 0;
  }
};

module.exports = {
  logAudit,
  getUserAuditHistory,
  getEntityAuditHistory,
  getAllAuditLogs,
  logUserLogin,
  logUserLogout,
  logUserRegistration,
  logProfileUpdate,
  logPasswordChange,
  logJobPosting,
  logJobUpdate,
  logJobDeletion,
  logJobApplication,
  logApplicationStatusChange,
  logRoleChange,
  logFileUpload,
  logFileDeletion,
  logExport,
  logFailedAction,
  clearOldAuditLogs
};
