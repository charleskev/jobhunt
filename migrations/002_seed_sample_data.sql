-- ============================================================================
-- HuntJob Database - Sample Data Seeding
-- Created: 2025-11-18
-- Purpose: Populate database with sample data for testing
-- ============================================================================

-- Insert Sample Users
INSERT INTO `Users` (id, email, password, firstName, lastName, gender, userType, isActive, isVerified, createdAt, updatedAt) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@municipality.gov.ph', '$2b$10$YourHashedPasswordHere', 'Admin', 'System', 'Male', 'sys_admin', true, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'hr.manager@municipality.gov.ph', '$2b$10$YourHashedPasswordHere', 'Maria', 'Santos', 'Female', 'hr_admin', true, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'manager.finance@municipality.gov.ph', '$2b$10$YourHashedPasswordHere', 'Juan', 'Reyes', 'Male', 'dept_manager', true, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'applicant1@email.com', '$2b$10$YourHashedPasswordHere', 'Pedro', 'Cruz', 'Male', 'applicant', true, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'applicant2@email.com', '$2b$10$YourHashedPasswordHere', 'Rosa', 'Fernandez', 'Female', 'applicant', true, true, NOW(), NOW());

-- Insert Sample Jobs
INSERT INTO `Jobs` (id, title, department, description, requirements, salaryRange, employmentType, positions, deadline, status, category, isActive, postedBy, createdAt, updatedAt) VALUES
('550e8400-e29b-41d4-a716-446655441001', 'Senior Software Engineer', 'IT', 'We are looking for an experienced software engineer to join our team...', 'Bachelor\'s degree in Computer Science, 5+ years experience with Java/Python', '₱80,000 - ₱120,000', 'Full-time', 2, DATE_ADD(NOW(), INTERVAL 30 DAY), 'open', 'Technology', true, '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655441002', 'HR Specialist', 'HR', 'Responsible for recruitment, employee relations, and HR policies...', 'Bachelor\'s degree in HR/Business, 3+ years HR experience, SHRM certification preferred', '₱50,000 - ₱75,000', 'Full-time', 1, DATE_ADD(NOW(), INTERVAL 25 DAY), 'open', 'Human Resources', true, '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655441003', 'Accountant', 'Finance', 'Maintain and analyze financial records of the municipality...', 'Bachelor\'s degree in Accounting, CPA/CMA certification, 2+ years experience', '₱45,000 - ₱65,000', 'Full-time', 3, DATE_ADD(NOW(), INTERVAL 20 DAY), 'open', 'Finance', true, '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655441004', 'Data Analyst', 'IT', 'Analyze and interpret complex datasets to support decision making...', 'Bachelor\'s degree in Statistics/Computer Science, Excel/SQL skills required', '₱60,000 - ₱85,000', 'Full-time', 1, DATE_ADD(NOW(), INTERVAL 35 DAY), 'open', 'Technology', true, '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW());

-- Insert Sample Applications
INSERT INTO `Applications` (id, jobId, userId, status, coverLetter, rating, declaration, createdAt, updatedAt) VALUES
('550e8400-e29b-41d4-a716-446655442001', '550e8400-e29b-41d4-a716-446655441001', '550e8400-e29b-41d4-a716-446655440004', 'submitted', 'I am very interested in this position...', NULL, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655442002', '550e8400-e29b-41d4-a716-446655441002', '550e8400-e29b-41d4-a716-446655440005', 'under_review', 'With my 4 years of HR experience...', 4, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655442003', '550e8400-e29b-41d4-a716-446655441003', '550e8400-e29b-41d4-a716-446655440004', 'shortlisted', 'As a certified public accountant...', 5, true, NOW(), NOW());

-- Insert Sample Saved Jobs
INSERT INTO `SavedJobs` (id, userId, jobId, savedAt) VALUES
('550e8400-e29b-41d4-a716-446655443001', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655441001', NOW()),
('550e8400-e29b-41d4-a716-446655443002', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655441004', NOW());

-- Insert Sample Notifications
INSERT INTO `Notifications` (id, userId, type, title, message, relatedType, isRead, createdAt, updatedAt) VALUES
('550e8400-e29b-41d4-a716-446655444001', '550e8400-e29b-41d4-a716-446655440005', 'application_status', 'Application Status Update', 'Your application for HR Specialist has been reviewed', 'Application', false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655444002', '550e8400-e29b-41d4-a716-446655440004', 'interview', 'Interview Scheduled', 'You have been invited for an interview', 'Application', false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655444003', '550e8400-e29b-41d4-a716-446655440005', 'new_job', 'New Job Posted', 'A new job matching your profile has been posted', 'Job', false, NOW(), NOW());

-- Insert Sample Audit Logs
INSERT INTO `AuditLogs` (id, userId, action, entityType, entityId, ipAddress, createdAt) VALUES
('550e8400-e29b-41d4-a716-446655445001', '550e8400-e29b-41d4-a716-446655440001', 'LOGIN', 'User', '550e8400-e29b-41d4-a716-446655440001', '127.0.0.1', NOW()),
('550e8400-e29b-41d4-a716-446655445002', '550e8400-e29b-41d4-a716-446655440002', 'JOB_CREATED', 'Job', '550e8400-e29b-41d4-a716-446655441001', '192.168.1.1', NOW()),
('550e8400-e29b-41d4-a716-446655445003', '550e8400-e29b-41d4-a716-446655440004', 'APPLICATION_SUBMITTED', 'Application', '550e8400-e29b-41d4-a716-446655442001', '192.168.1.5', NOW()),
('550e8400-e29b-41d4-a716-446655445004', '550e8400-e29b-41d4-a716-446655440002', 'USER_VERIFIED', 'User', '550e8400-e29b-41d4-a716-446655440005', '127.0.0.1', NOW());

-- ============================================================================
-- Sample Data Seeding Complete!
-- ============================================================================
