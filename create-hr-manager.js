import bcrypt from 'bcrypt';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

// Usage: node create-hr-manager.js [hrEmail] [hrPassword] [managerEmail] [managerPassword] [managerDepartment]
// Example: node create-hr-manager.js hr@huntjob.com Hr@12345 manager@huntjob.com Manager@12345 IT

const args = process.argv.slice(2);

const hrEmail = args[0] || 'hr@huntjob.com';
const hrPassword = args[1] || 'Hr@123456';

const managerEmail = args[2] || 'manager@huntjob.com';
const managerPassword = args[3] || 'Manager@123456';
const managerDepartment = args[4] || 'Administration';

async function createAccounts() {
  try {
    await sequelize.sync();

    // HR Admin
    const existingHR = await User.findOne({ where: { email: hrEmail } });
    if (existingHR) {
      console.log(`HR account already exists: ${hrEmail}`);
    } else {
      const hashed = await bcrypt.hash(hrPassword, 10);
      await User.create({
        email: hrEmail,
        password: hashed,
        firstName: 'HR',
        lastName: 'Admin',
        userType: 'hr_admin',
        isActive: true,
        isVerified: true
      });
      console.log('Created HR account:');
      console.log('  Email:', hrEmail);
      console.log('  Password:', hrPassword);
    }

    // Department Manager
    const existingMgr = await User.findOne({ where: { email: managerEmail } });
    if (existingMgr) {
      console.log(`Manager account already exists: ${managerEmail}`);
    } else {
      const hashed2 = await bcrypt.hash(managerPassword, 10);
      await User.create({
        email: managerEmail,
        password: hashed2,
        firstName: 'Dept',
        lastName: 'Manager',
        userType: 'dept_manager',
        department: managerDepartment,
        isActive: true,
        isVerified: true
      });
      console.log('Created Manager account:');
      console.log('  Email:', managerEmail);
      console.log('  Password:', managerPassword);
      console.log('  Department:', managerDepartment);
    }

  } catch (err) {
    console.error('Error creating accounts:', err.message || err);
  } finally {
    await sequelize.close();
  }
}

createAccounts();
