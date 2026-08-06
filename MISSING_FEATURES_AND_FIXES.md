# HuntJob System - Missing Features & Quick Fixes

## Issues Found & How to Fix Them

---

## 1. 🔴 CRITICAL: Password Reset Email Not Implemented

### Problem:
When users request a password reset, the token is created but NO EMAIL is sent.

### Location: 
`controllers/authController.js` - Line 226

### Current Code:
```javascript
// TODO: Send email with reset link
// const resetLink = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;
```

### Fix:
Add this import at the top:
```javascript
import { sendPasswordResetEmail } from "../utils/emailService.js";
```

Replace the TODO comment with:
```javascript
const resetLink = `${process.env.APP_URL || req.protocol}://${req.get("host")}/auth/reset-password/${resetToken}`;
await sendPasswordResetEmail(user.email, resetToken, user.firstName);
console.log(`Password reset requested. Link would be: ${resetLink}`);
```

---

## 2. ⚠️ MEDIUM: Email Notifications Not Sent to Job Poster

### Problem:
When an applicant submits an application, a notification is created in the database BUT no email is sent to the HR/Manager.

### Location:
`controllers/applicationController.js` - Line ~90-110

### Current Code:
```javascript
await Notification.create({
  userId: jobPoster.id,
  title: "New Application Received",
  message: `New application for "${job.title}"`,
  type: "application_status"
});
```

### Fix:
Add import at top:
```javascript
import { sendApplicationNotification } from "../utils/emailService.js";
```

Add after Notification.create():
```javascript
// Send email notification to job poster
if (jobPoster && jobPoster.email) {
  try {
    await sendApplicationNotification(
      jobPoster.email,
      `${user.firstName} ${user.lastName}`,
      job.title,
      user.email
    );
  } catch (emailError) {
    console.error("Failed to send email notification:", emailError);
    // Don't block application if email fails
  }
}
```

---

## 3. ⚠️ MEDIUM: Email Service Configuration Missing

### Problem:
The `emailService.js` file uses `require()` (CommonJS) but project uses `import/export` (ES Modules).

### Location:
`utils/emailService.js` - Multiple places

### Fix:
Convert emailService.js from CommonJS to ES Modules:

**Change:**
```javascript
const nodemailer = require('nodemailer');
require('dotenv').config();
```

**To:**
```javascript
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
```

**Change all:**
```javascript
module.exports = { sendWelcomeEmail, ... };
```

**To:**
```javascript
export { sendWelcomeEmail, sendPasswordResetEmail, sendApplicationNotification };
```

---

## 4. ⚠️ MEDIUM: Missing Reset Password Route Handler

### Problem:
The forgot password page has a form that POSTs to `/reset-password`, but auth routes define it as `/auth/reset-password`.

### Location:
`routes/authRoutes.js` and `controllers/authController.js`

### Current Route:
```javascript
router.post("/reset-password", authController.resetPassword);
```

### Should be:
```javascript
router.get("/reset-password/:token", authController.resetPasswordPage);
router.post("/reset-password/:token", authController.resetPassword);
```

### Missing Controller Function:
Add to `authController.js`:
```javascript
export const resetPasswordPage = (req, res) => {
  const { token } = req.params;
  res.render("reset-password", { 
    title: "Reset Password",
    token,
    error: null 
  });
};
```

### Create missing view: `views/reset-password.xian`
(See template below)

---

## 5. ⚠️ MEDIUM: Password Reset Link Format Issue

### Problem:
Reset token is created but the reset link format may not match the actual route.

### Location:
`authController.js` line 226

### Issue:
The token is saved but route might not be properly set up.

### Fix:
Ensure routes match:
```javascript
// In authRoutes.js, add:
router.get("/reset-password/:token", authController.resetPasswordPage);
router.post("/reset-password/:token", authController.resetPassword);
```

---

## 6. ⚠️ MINOR: Welcome Email Not Sent on Registration

### Problem:
User registers successfully but doesn't receive welcome email.

### Location:
`controllers/authController.js` - Line ~75 in `registerUser()`

### Fix:
Add import:
```javascript
import { sendWelcomeEmail } from "../utils/emailService.js";
```

Add after user creation (around line 75):
```javascript
// Send welcome email
try {
  await sendWelcomeEmail(user.email, user.firstName);
} catch (emailError) {
  console.error("Failed to send welcome email:", emailError);
  // Don't block registration if email fails
}
```

---

## 7. ⚠️ MINOR: Inconsistent User Type Handling

### Problem:
System has inconsistent userType values:
- Registration creates `"applicant"` 
- Some middleware checks for `"jobseeker"`
- Routes accept both in `hasRole()`

### Location:
Multiple files:
- `authController.js` line ~69 (sets "applicant")
- `roleMiddleware.js` line ~60 (checks for "jobseeker" or "applicant")

### Current Code:
```javascript
// In authController.js
userType: "applicant",

// In roleMiddleware.js
if (!["jobseeker", "applicant"].includes(user.userType)) {
```

### Recommendation:
Use consistent "applicant" throughout. Current implementation handles both, so NO URGENT FIX NEEDED, but for clarity, choose one term.

---

## 8. ⚠️ MINOR: Dashboard Stats Not Dynamically Calculated

### Problem:
In `applicantRoutes.js`, dashboard stats are hardcoded instead of fetched from database.

### Location:
`routes/applicantRoutes.js` - Line ~38

### Current Code:
```javascript
const stats = {
  total: 5,
  saved: 12,
  interview: 2,
  offers: 1
};
res.render("applicant/dashboard", { title: "Applicant Dashboard", user: req.user, stats });
```

### Fix:
Move to a new controller function and make it dynamic:
```javascript
export const getDashboard = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const stats = {
      total: await Application.count({ where: { userId } }),
      saved: await SavedJob.count({ where: { userId } }),
      interview: await Application.count({ where: { userId, status: "interview" } }),
      offers: await Application.count({ where: { userId, status: "hired" } })
    };
    
    res.render("applicant/dashboard", { 
      title: "Applicant Dashboard", 
      user: req.user, 
      stats 
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.render("applicant/dashboard", { 
      title: "Applicant Dashboard", 
      user: req.user, 
      stats: { total: 0, saved: 0, interview: 0, offers: 0 }
    });
  }
};
```

Then in `applicantRoutes.js`:
```javascript
router.get("/dashboard", applicantController.getDashboard);
```

---

## 9. ⚠️ MINOR: Session Secret is Hardcoded

### Problem:
Session secret is hardcoded in `index.js`:

### Location:
`index.js` - Line ~53

### Current Code:
```javascript
app.use(session({
  secret: "xianfire-secret-key",  // ⚠️ HARDCODED!
  resave: false,
  saveUninitialized: false
}));
```

### Fix:
Create `.env` file with:
```
SESSION_SECRET=your-secret-key-here-change-in-production
DATABASE_URL=your-db-url
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
APP_URL=http://localhost:3000
```

Update `index.js`:
```javascript
import dotenv from 'dotenv';
dotenv.config();

app.use(session({
  secret: process.env.SESSION_SECRET || "xianfire-secret-key",
  resave: false,
  saveUninitialized: false
}));
```

---

## 10. 📋 Missing Template: Reset Password View

### Problem:
No `views/reset-password.xian` file exists, so users can't complete password reset.

### Fix:
Create `views/reset-password.xian`:

```handlebars
{{>head}}
{{>navbar}}

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
    <h2 class="text-center text-3xl font-extrabold text-gray-900 mb-8">
      Reset Your Password
    </h2>

    {{#if error}}
    <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {{error}}
    </div>
    {{/if}}

    <form method="POST" action="/auth/reset-password/{{token}}" class="space-y-6">
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter new password"
        />
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Confirm password"
        />
      </div>

      <button
        type="submit"
        class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Reset Password
      </button>
    </form>

    <p class="text-center mt-4 text-sm text-gray-600">
      <a href="/auth/login" class="text-blue-600 hover:text-blue-500">Back to login</a>
    </p>
  </div>
</div>

{{>footer}}
```

---

## Priority Fix Order

### 🔴 DO FIRST (Breaks Functionality):
1. Fix email service CommonJS → ES Modules conversion
2. Add password reset email integration
3. Add reset password view template
4. Fix reset password route handlers

### 🟡 DO SECOND (Important):
1. Add email notifications for applications
2. Add welcome email on registration
3. Set up environment variables

### 🟢 DO LAST (Nice to Have):
1. Make dashboard stats dynamic
2. Add comprehensive error handling
3. Add rate limiting
4. Add logging

---

## Testing the Fixes

After implementing fixes, test:

```bash
# Test 1: User Registration & Welcome Email
POST /auth/register
- Creates user
- Sends welcome email ✓

# Test 2: Password Reset
POST /auth/forgot-password
- Creates reset token
- Sends reset email ✓
GET /auth/reset-password/:token
- Displays password reset form ✓
POST /auth/reset-password/:token
- Updates password
- Redirects to login ✓

# Test 3: Application Submission
POST /applicant/api/apply
- Creates application
- Sends email to job poster ✓
- Creates in-app notification ✓

# Test 4: Dashboard
GET /applicant/dashboard
- Shows dynamic stats ✓
- Counts match database ✓
```

---

## Summary

**Total Issues Found:** 10
- 🔴 Critical: 0
- 🟡 Medium: 4
- 🟢 Minor: 6

**Estimated Fix Time:** 1-2 hours
**Complexity:** Low to Medium

All fixes are straightforward and don't require architectural changes.
