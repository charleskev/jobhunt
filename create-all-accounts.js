import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

async function createAllAccounts() {
  try {
    await sequelize.sync();

    // HR 1 Account
    await User.destroy({ where: { email: 'hr1@huntjob.com' } });
    const hr1Password = 'HR1Pass123';
    const hr1Hashed = await bcrypt.hash(hr1Password, 10);
    await User.create({
      email: 'hr1@huntjob.com',
      password: hr1Hashed,
      firstName: 'HR',
      lastName: 'One',
      userType: 'hr_admin',
      isActive: true,
      isVerified: true
    });
    console.log('\n✓ HR1 Account Created!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email: hr1@huntjob.com');
    console.log('Password: HR1Pass123');
    console.log('Role: HR Administrator');
    console.log('Dashboard: /hr/dashboard');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // HR 2.0 Account (Dept Manager)
    await User.destroy({ where: { email: 'hr20@huntjob.com' } });
    const hr20Password = 'HR20Pass123';
    const hr20Hashed = await bcrypt.hash(hr20Password, 10);
    await User.create({
      email: 'hr20@huntjob.com',
      password: hr20Hashed,
      firstName: 'HR',
      lastName: 'TwoPoint Zero',
      userType: 'dept_manager',
      isActive: true,
      isVerified: true,
      department: 'General'
    });
    console.log('\n✓ HR 2.0 Account Created!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email: hr20@huntjob.com');
    console.log('Password: HR20Pass123');
    console.log('Role: Department Manager');
    console.log('Dashboard: /hr2.0/dashboard');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Admin Account
    await User.destroy({ where: { email: 'admin1@huntjob.com' } });
    const adminPassword = 'AdminPass123';
    const adminHashed = await bcrypt.hash(adminPassword, 10);
    await User.create({
      email: 'admin1@huntjob.com',
      password: adminHashed,
      firstName: 'System',
      lastName: 'Administrator',
      userType: 'sys_admin',
      isActive: true,
      isVerified: true
    });
    console.log('\n✓ Admin Account Created!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email: admin1@huntjob.com');
    console.log('Password: AdminPass123');
    console.log('Role: System Administrator');
    console.log('Dashboard: /admin/dashboard');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createAllAccounts();
