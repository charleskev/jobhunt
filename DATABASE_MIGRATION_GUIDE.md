# HuntJob Database Migration Guide

## Overview
This guide provides instructions for migrating the HuntJob application database from development to production environments.

## Database Schema

### Tables Overview

#### 1. **Users**
Stores user account information and authentication details.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | User email (unique) |
| password | VARCHAR(500) | Hashed password |
| firstName | VARCHAR(100) | First name |
| lastName | VARCHAR(100) | Last name |
| userType | ENUM | Role: applicant, hr_admin, dept_manager, sys_admin |
| department | VARCHAR(100) | Department (for managers) |
| isActive | BOOLEAN | Account status |
| isVerified | BOOLEAN | Email verification status |
| lastLogin | DATETIME | Last login timestamp |

**Indexes:** email (unique), userType, department, isActive, createdAt

---

#### 2. **Jobs**
Job postings created by HR administrators.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Job title |
| department | VARCHAR(100) | Department |
| description | LONGTEXT | Job description |
| salaryRange | VARCHAR(100) | Salary range |
| employmentType | ENUM | Full-time, Part-time, Contract, Casual |
| positions | INT | Number of open positions |
| deadline | DATETIME | Application deadline |
| status | ENUM | open, closed, filled |
| postedBy | UUID | Foreign key to Users |
| viewCount | INT | Number of views |

**Indexes:** department, status, postedBy, deadline, Full-text search on title/description

---

#### 3. **Applications**
Job applications submitted by applicants.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| jobId | UUID | Foreign key to Jobs |
| userId | UUID | Foreign key to Users (applicant) |
| status | ENUM | submitted, under_review, shortlisted, interview, rejected, hired |
| coverLetter | LONGTEXT | Applicant's cover letter |
| rating | INT | HR rating (1-5) |
| hrNotes | LONGTEXT | Notes from HR |
| managerNotes | LONGTEXT | Notes from department manager |
| reviewedBy | UUID | Foreign key to Users (reviewer) |
| interviewDate | DATETIME | Scheduled interview |

**Constraints:** Unique constraint on (jobId, userId) - one application per job per user

**Indexes:** jobId, userId, status, reviewedBy, createdAt

---

#### 4. **SavedJobs**
Applicants' bookmarked/saved job postings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to Users |
| jobId | UUID | Foreign key to Jobs |
| savedAt | DATETIME | When job was saved |

**Constraints:** Unique constraint on (userId, jobId)

---

#### 5. **Notifications**
System notifications for users about applications, new jobs, interviews, etc.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to Users |
| type | ENUM | application_status, new_job, message, interview, reminder, system |
| title | VARCHAR(255) | Notification title |
| message | LONGTEXT | Notification message |
| isRead | BOOLEAN | Read status |
| readAt | DATETIME | When notification was read |
| metadata | JSON | Additional data |

**Indexes:** userId, type, isRead, createdAt

---

#### 6. **Documents**
Uploaded documents for job applications (resume, diploma, etc.).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| applicationId | UUID | Foreign key to Applications |
| userId | UUID | Foreign key to Users |
| documentType | VARCHAR(100) | Type (Resume, Diploma, NBI Clearance, etc.) |
| fileName | VARCHAR(255) | Original file name |
| filePath | VARCHAR(500) | Stored file path |
| mimeType | VARCHAR(100) | File MIME type |
| fileSize | BIGINT | Size in bytes |

**Indexes:** applicationId, userId, documentType

---

#### 7. **AuditLogs**
System audit trail for compliance and security.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to Users |
| action | VARCHAR(100) | Action type (LOGIN, JOB_CREATED, etc.) |
| entityType | VARCHAR(100) | Entity type (User, Job, Application) |
| entityId | UUID | ID of affected entity |
| ipAddress | VARCHAR(45) | IP address |
| userAgent | VARCHAR(500) | Browser/client info |
| metadata | JSON | Additional data |

**Indexes:** userId, action, entityType, createdAt

---

## Migration Methods

### Method 1: SQL Migration (Production Recommended)
Direct SQL execution - best for production environments.

```bash
npm run migrate
# Choose: "SQL Migration (SQL Scripts - Recommended for Production)"
```

**Files:**
- `migrations/001_create_tables.sql` - Creates all tables and indexes
- `migrations/002_seed_sample_data.sql` - Adds sample data (optional)

---

### Method 2: Sequelize Sync (Development Recommended)
Using Sequelize ORM sync - easier for development.

```bash
npm run migrate
# Choose: "Auto Sync (Sequelize ORM - Recommended for Development)"
```

**Options:**
- Normal sync (alter): Modifies existing tables
- Force sync (drops tables): Removes and recreates tables

---

### Method 3: Both
Runs SQL migration first, then Sequelize sync.

```bash
npm run migrate
# Choose: "Both"
```

---

## Quick Start Guide

### 1. Prerequisites
- MySQL server running on localhost:3306
- Node.js environment set up
- `.env` file configured with database credentials

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=huntjob
```

### 2. Run Migration
```bash
# Install dependencies
npm install

# Run migration
npm run migrate
```

### 3. Verify Migration
```bash
# Check if tables were created
mysql -u root huntjob -e "SHOW TABLES;"

# Check Users table structure
mysql -u root huntjob -e "DESC Users;"
```

---

## Common Issues & Solutions

### Issue: "Database does not exist"
**Solution:** Migration will automatically create the database if it doesn't exist.

### Issue: "Access denied for user 'root'@'localhost'"
**Solution:** Check MySQL credentials in `models/db.js`:
```javascript
const sequelize = new Sequelize("huntjob", "root", "", {
  host: "localhost",
  dialect: "mysql"
});
```

### Issue: "Foreign key constraint fails"
**Solution:** Drop existing tables before running migration:
```bash
npm run migrate
# Choose: "Force sync" when prompted
```

### Issue: "Table already exists"
**Solution:** This is normal. The migration script handles existing tables safely.

---

## Backup & Recovery

### Create Database Backup
```bash
mysqldump -u root huntjob > backup_huntjob_$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
mysql -u root huntjob < backup_huntjob_20251118.sql
```

---

## Performance Considerations

### Indexes
- **Users**: Indexed on email (unique), userType, department for fast lookups
- **Jobs**: Indexed on status, department, deadline for filtering
- **Applications**: Indexed on jobId, userId, status for relationship queries
- **Full-text search**: Enabled on Jobs.title and Jobs.description

### Connection Pool
Default connection pool size is 5. Adjust in production:
```javascript
const sequelize = new Sequelize("huntjob", "root", "", {
  host: "localhost",
  dialect: "mysql",
  pool: {
    max: 10,      // Increase for high concurrency
    min: 2,
    acquire: 30000,
    idle: 10000
  }
});
```

---

## Development Workflow

### Adding New Tables
1. Create model in `/models/YourModel.js`
2. Create migration SQL in `/migrations/003_add_your_table.sql`
3. Run migration: `npm run migrate`

### Modifying Existing Tables
1. Update model definition in `/models/YourModel.js`
2. Run with alter option: `npm run migrate` → select "Auto Sync"

---

## Support & Documentation

- Database: MySQL 5.7+
- ORM: Sequelize 6.x
- Node.js: 14+
- See `/models/` for table definitions

---

**Last Updated:** 2025-11-18
