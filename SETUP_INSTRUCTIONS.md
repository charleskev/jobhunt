# HuntJob System - Complete Setup Guide

## Account Credentials

### HR 1 Accounts (Create Jobs)
- **hr1@huntjob.com** - Password: `Hr@123456`
- **hr2@huntjob.com** - Password: `Hr@123456`
- **hr3@huntjob.com** - Password: `Hr@123456`
- **hr4@huntjob.com** - Password: `Hr@123456`
- **hr5@huntjob.com** - Password: `Hr@123456`

### HR 2.0 Accounts (Manage Recruitment)
- **hr20_1@huntjob.com** - Password: `Hr@123456` (General Department)
- **hr20_2@huntjob.com** - Password: `Hr@123456` (IT Department)
- **hr20_3@huntjob.com** - Password: `Hr@123456` (Finance Department)
- **hr20_4@huntjob.com** - Password: `Hr@123456` (HR Department)

### Admin Account
- **admin1@huntjob.com** - Password: `AdminPass123`

---

## System Workflow

### HR 1 Dashboard (`/hr/dashboard`)
**Functions:**
- ✅ Create Municipality Jobs (POST to `/hr/api/jobs`)
- ✅ Create Department Jobs (POST to `/hr/api/jobs`)
- ✅ View All Jobs
- ✅ View Applications
- ✅ Reports
- ✅ Notifications

**Navigation:**
1. Log in with HR account
2. Click "Dashboard" to see overview
3. Use sidebar to navigate:
   - **All Jobs** - View all posted jobs
   - **Post Municipality Job** - Create new municipality job
   - **Post Department Job** - Create new department job
   - **All Applications** - View applications for your jobs
   - **Pending Review** - View applications needing review
   - **Reports** - View recruitment reports

### HR 2.0 Dashboard (`/hr2.0/dashboard`)
**Functions:**
- ✅ View ALL jobs across organization
- ✅ View ALL applications
- ✅ Review applications with quick actions
- ✅ Shortlist candidates
- ✅ Schedule interviews
- ✅ Accept/Reject/Hire candidates
- ✅ Provide feedback and ratings

**Navigation:**
1. Log in with HR 2.0 account
2. Dashboard shows organizational statistics
3. Use sidebar to navigate:
   - **Dashboard** - Overview stats
   - **All Jobs** - Browse all available jobs
   - **All Applications** - View all pending applications
   - **Pending Review** - Quick access to applications needing review

**Application Review Actions:**
Click on any application to access quick action buttons:
- ⭐ **Shortlist** - Mark candidate as shortlisted
- 📅 **Schedule Interview** - Set for interview stage
- ✓ **Accept** - Accept the candidate
- 🎉 **Hire** - Mark as hired
- ✕ **Reject** - Reject application

---

## Recent Fixes Applied

### ✅ Fixed Issues:
1. **HR Dashboard Rendering** - Fixed to render `/hr/dashboard` instead of `/hr2.0/dashboard`
2. **Job Form API Endpoints** - Both forms now POST to `/hr/api/jobs`
3. **Department Job Form Action** - Fixed from `/hr2.0/api/jobs` to `/hr/api/jobs`
4. **Logout Links** - Fixed all logout links to use `/auth/logout` endpoint
5. **Application Status Updates** - Enhanced to handle rating and feedback fields
6. **HR 2.0 Applications List Layout** - Fixed table layout for proper display:
   - Added horizontal scroll handling
   - Made columns responsive
   - Added sticky headers
   - Improved text truncation
   - Better action button visibility

---

## Key Features

### HR 1 - Job Creation
- Create municipality-level job postings
- Create department-level job postings
- Specify job requirements, salary range, positions, deadline
- Required documents selection
- Department/Municipality assignment

### HR 2.0 - Recruitment Management
- View applications across all departments
- Quick filtering by status
- Search by applicant name/email
- View applicant profiles and documents
- Rate applicants (1-5 stars)
- Add feedback and notes
- Quick status updates with one click
- Automatic notifications to applicants

### Admin Dashboard
- System administration
- User management
- System settings
- Audit logs
- Backup management

---

## Troubleshooting

### Issue: Can't see all columns in HR 2.0 applications list
**Solution:** Layout has been fixed. Refresh browser (Ctrl+F5) to clear cache.

### Issue: Job creation returns 404
**Solution:** Ensure you're using correct endpoint `/hr/api/jobs` (not `/hr2.0/api/jobs`)

### Issue: Logout not working
**Solution:** Use `/auth/logout` endpoint. All sidebar links have been updated.

### Issue: Application status buttons not working
**Solution:** Ensure you're logged in as HR 2.0 (dept_manager) user and application exists.

---

## Access URLs

- **Home:** `http://localhost:3000/`
- **Login:** `http://localhost:3000/auth/login`
- **HR Dashboard:** `http://localhost:3000/hr/dashboard`
- **HR 2.0 Dashboard:** `http://localhost:3000/hr2.0/dashboard`
- **Admin Dashboard:** `http://localhost:3000/admin/dashboard`
- **Browse Jobs:** `http://localhost:3000/jobs`

---

## Notes for Testing

1. **Create Jobs First** - Log in as HR 1 account and create some jobs
2. **Browse Jobs** - Go to Browse Jobs to see created jobs
3. **Apply as Applicant** - Create new account and apply for jobs
4. **Review in HR 2.0** - Log in as HR 2.0 account to review applications
5. **Take Actions** - Use quick action buttons to manage candidates

---

Last Updated: December 10, 2025
All systems tested and working!
