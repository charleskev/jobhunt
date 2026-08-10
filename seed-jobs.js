import { sequelize } from './models/db.js';
import { User } from './models/User.js';
import { Job } from './models/Job.js';
import bcrypt from 'bcryptjs';

// Usage: node seed-jobs.js

async function seed() {
  try {
    await sequelize.sync();

    // Ensure sys_admin exists (use admin@gmail.com default)
    const adminEmail = 'admin@gmail.com';
    let admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const hashed = await bcrypt.hash('Admin@123456', 10);
      admin = await User.create({
        email: adminEmail,
        password: hashed,
        firstName: 'System',
        lastName: 'Administrator',
        userType: 'sys_admin',
        isActive: true,
        isVerified: true
      });
      console.log('Created admin user:', adminEmail);
    } else {
      console.log('Found admin user:', adminEmail);
    }

    // Nurse job
    const nurseTitle = 'Registered Nurse';
    let nurse = await Job.findOne({ where: { title: nurseTitle } });
    if (!nurse) {
      nurse = await Job.create({
        title: nurseTitle,
        department: 'Health Services',
        description: 'Provide nursing care to patients in municipal health centers and clinics.',
        requirements: '<ul><li>BS Nursing degree</li><li>At least 1 year experience preferred</li></ul>',
        requirements: '<ul><li>BS Nursing degree</li><li>At least 1 year experience preferred</li></ul>',
        salaryRange: '20,000 - 30,000 PHP',
        employmentType: 'Full-time',
        positions: 3,
        deadline: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
        requiredDocuments: JSON.stringify(['Resume', "Nursing License", 'Diploma/Transcript', 'NBI Clearance']),
        postedBy: admin.id,
        status: 'open',
        isActive: true
      });
      console.log('Created job:', nurseTitle);
    } else {
      console.log('Job already exists:', nurseTitle);
    }

    // Driver job
    const driverTitle = 'Driver (Heavy/Light Vehicle)';
    let driver = await Job.findOne({ where: { title: driverTitle } });
    if (!driver) {
      driver = await Job.create({
        title: driverTitle,
        department: 'Logistics',
        description: 'Drive municipal vehicles for official duties; perform vehicle inspections and basic maintenance.',
        requirements: '<ul><li>High school diploma</li><li>Valid Driver\'s License</li></ul>',
        salaryRange: '12,000 - 18,000 PHP',
        employmentType: 'Full-time',
        positions: 2,
        deadline: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000),
        requiredDocuments: JSON.stringify(['Resume', "Valid Driver's License", 'Medical Certificate', 'NBI Clearance']),
        postedBy: admin.id,
        status: 'open',
        isActive: true
      });
      console.log('Created job:', driverTitle);
    } else {
      console.log('Job already exists:', driverTitle);
    }

    console.log('\nSeeding complete.');
  } catch (err) {
    console.error('Seeding error:', err.message || err);
  } finally {
    await sequelize.close();
  }
}

seed();