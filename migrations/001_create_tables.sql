-- ============================================================================
-- HuntJob Database Migration
-- Created: 2025-11-18
-- Purpose: Create all tables for job application management system
-- ============================================================================

-- Create Users table
CREATE TABLE IF NOT EXISTS `Users` (
  `id` CHAR(36) NOT NULL PRIMARY KEY COMMENT 'UUID',
  `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'User email address',
  `password` VARCHAR(500) NOT NULL COMMENT 'Hashed password',
  `firstName` VARCHAR(100) NOT NULL COMMENT 'First name',
  `lastName` VARCHAR(100) NOT NULL COMMENT 'Last name',
  `middleName` VARCHAR(100) NULL COMMENT 'Middle name',
  `contactNumber` VARCHAR(20) NULL COMMENT 'Phone number',
  `address` TEXT NULL COMMENT 'Home address',
  `barangay` VARCHAR(100) NULL COMMENT 'Barangay location',
  `dateOfBirth` DATE NULL COMMENT 'Date of birth',
  `gender` ENUM('Male', 'Female', 'Other') NULL COMMENT 'Gender',
  `userType` ENUM('applicant', 'hr_admin', 'dept_manager', 'sys_admin') NOT NULL DEFAULT 'applicant' COMMENT 'User role type',
  `department` VARCHAR(100) NULL COMMENT 'Department for dept_manager role',
  `isActive` BOOLEAN NOT NULL DEFAULT true COMMENT 'Account active status',
  `isVerified` BOOLEAN NOT NULL DEFAULT false COMMENT 'Email verification status',
  `lastLogin` DATETIME NULL COMMENT 'Last login timestamp',
  `resetToken` VARCHAR(500) NULL COMMENT 'Password reset token',
  `resetTokenExpiry` DATETIME NULL COMMENT 'Password reset token expiry',
  `profilePhoto` VARCHAR(255) NULL COMMENT 'Profile photo file path',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_email` (`email`),
  INDEX `idx_userType` (`userType`),
  INDEX `idx_department` (`department`),
  INDEX `idx_isActive` (`isActive`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Jobs table
CREATE TABLE IF NOT EXISTS `Jobs` (
  `id` CHAR(36) NOT NULL PRIMARY KEY COMMENT 'UUID',
  `title` VARCHAR(255) NOT NULL COMMENT 'Job title',
  `department` VARCHAR(100) NOT NULL COMMENT 'Department',
  `description` LONGTEXT NOT NULL COMMENT 'Job description',
  `requirements` LONGTEXT NULL COMMENT 'Job requirements (JSON or CSV)',
  `salaryRange` VARCHAR(100) NULL COMMENT 'Salary range',
  `employmentType` ENUM('Full-time', 'Part-time', 'Contract', 'Casual') NOT NULL DEFAULT 'Full-time' COMMENT 'Type of employment',
  `positions` INT NOT NULL DEFAULT 1 COMMENT 'Number of positions',
  `deadline` DATETIME NULL COMMENT 'Application deadline',
  `status` ENUM('open', 'closed', 'filled') NOT NULL DEFAULT 'open' COMMENT 'Job posting status',
  `requiredDocuments` LONGTEXT NULL COMMENT 'Required documents in JSON array',
  `postedBy` CHAR(36) NOT NULL COMMENT 'User who posted the job',
  `viewCount` INT NOT NULL DEFAULT 0 COMMENT 'Number of views',
  `category` VARCHAR(100) NULL COMMENT 'Job category',
  `isActive` BOOLEAN NOT NULL DEFAULT true COMMENT 'Job active status',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`postedBy`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  
  INDEX `idx_department` (`department`),
  INDEX `idx_status` (`status`),
  INDEX `idx_postedBy` (`postedBy`),
  INDEX `idx_deadline` (`deadline`),
  INDEX `idx_isActive` (`isActive`),
  INDEX `idx_createdAt` (`createdAt`),
  FULLTEXT INDEX `idx_fulltext_search` (`title`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Applications table
CREATE TABLE IF NOT EXISTS `Applications` (
  `id` CHAR(36) NOT NULL PRIMARY KEY COMMENT 'UUID',
  `jobId` CHAR(36) NOT NULL COMMENT 'Job ID',
  `userId` CHAR(36) NOT NULL COMMENT 'Applicant user ID',
  `status` ENUM('submitted', 'under_review', 'shortlisted', 'interview', 'rejected', 'hired') NOT NULL DEFAULT 'submitted' COMMENT 'Application status',
  `coverLetter` LONGTEXT NULL COMMENT 'Cover letter content',
  `rating` INT NULL COMMENT 'HR rating (1-5)',
  `hrNotes` LONGTEXT NULL COMMENT 'Notes from HR',
  `managerNotes` LONGTEXT NULL COMMENT 'Notes from manager',
  `reviewedBy` CHAR(36) NULL COMMENT 'User who reviewed the application',
  `reviewedAt` DATETIME NULL COMMENT 'When the application was reviewed',
  `interviewDate` DATETIME NULL COMMENT 'Scheduled interview date',
  `declaration` BOOLEAN NOT NULL DEFAULT false COMMENT 'Applicant declaration acceptance',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`jobId`) REFERENCES `Jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`reviewedBy`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  
  INDEX `idx_jobId` (`jobId`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_reviewedBy` (`reviewedBy`),
  INDEX `idx_createdAt` (`createdAt`),
  UNIQUE KEY `unique_job_user_application` (`jobId`, `userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create SavedJobs table
CREATE TABLE IF NOT EXISTS `SavedJobs` (
  `id` CHAR(36) NOT NULL PRIMARY KEY COMMENT 'UUID',
  `userId` CHAR(36) NOT NULL COMMENT 'User ID',
  `jobId` CHAR(36) NOT NULL COMMENT 'Job ID',
  `savedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When job was saved',
  
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`jobId`) REFERENCES `Jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  
  INDEX `idx_userId` (`userId`),
  INDEX `idx_jobId` (`jobId`),
  UNIQUE KEY `unique_saved_job` (`userId`, `jobId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Notifications table
CREATE TABLE IF NOT EXISTS `Notifications` (
  `id` CHAR(36) NOT NULL PRIMARY KEY COMMENT 'UUID',
  `userId` CHAR(36) NOT NULL COMMENT 'Recipient user ID',
  `type` ENUM('application_status', 'new_job', 'message', 'interview', 'reminder', 'system') NOT NULL COMMENT 'Notification type',
  `title` VARCHAR(255) NOT NULL COMMENT 'Notification title',
  `message` LONGTEXT NOT NULL COMMENT 'Notification message',
  `relatedId` CHAR(36) NULL COMMENT 'Related entity ID',
  `relatedType` VARCHAR(100) NULL COMMENT 'Related entity type (Job, Application, etc.)',
  `isRead` BOOLEAN NOT NULL DEFAULT false COMMENT 'Read status',
  `readAt` DATETIME NULL COMMENT 'When notification was read',
  `metadata` JSON NULL COMMENT 'Additional data in JSON format',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  
  INDEX `idx_userId` (`userId`),
  INDEX `idx_type` (`type`),
  INDEX `idx_isRead` (`isRead`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Documents table
CREATE TABLE IF NOT EXISTS `Documents` (
  `id` CHAR(36) NOT NULL PRIMARY KEY COMMENT 'UUID',
  `applicationId` CHAR(36) NOT NULL COMMENT 'Application ID',
  `userId` CHAR(36) NOT NULL COMMENT 'User who uploaded',
  `documentType` VARCHAR(100) NOT NULL COMMENT 'Type of document (Resume, Diploma, etc.)',
  `fileName` VARCHAR(255) NOT NULL COMMENT 'Original file name',
  `filePath` VARCHAR(500) NOT NULL COMMENT 'Stored file path',
  `mimeType` VARCHAR(100) NULL COMMENT 'File MIME type',
  `fileSize` BIGINT NULL COMMENT 'File size in bytes',
  `uploadedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`applicationId`) REFERENCES `Applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  
  INDEX `idx_applicationId` (`applicationId`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_documentType` (`documentType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create AuditLogs table
CREATE TABLE IF NOT EXISTS `AuditLogs` (
  `id` CHAR(36) NOT NULL PRIMARY KEY COMMENT 'UUID',
  `userId` CHAR(36) NULL COMMENT 'User who performed the action',
  `action` VARCHAR(100) NOT NULL COMMENT 'Action type (LOGIN, JOB_CREATED, etc.)',
  `entityType` VARCHAR(100) NULL COMMENT 'Type of entity affected',
  `entityId` CHAR(36) NULL COMMENT 'ID of entity affected',
  `ipAddress` VARCHAR(45) NULL COMMENT 'IP address of requester',
  `userAgent` VARCHAR(500) NULL COMMENT 'User agent string',
  `metadata` JSON NULL COMMENT 'Additional metadata in JSON',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  
  INDEX `idx_userId` (`userId`),
  INDEX `idx_action` (`action`),
  INDEX `idx_entityType` (`entityType`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Migration complete!
-- ============================================================================
