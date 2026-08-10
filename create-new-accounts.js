import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

async function createNewAccounts() {
  try {
    await sequelize.sync();

    // New Admin Account
    const newAdminEmail = 'newadmin@huntjob.com';
    const newAdminPassword = 'NewAdmin@2024';

    // Check and delete if exists
    await User.destroy({ where: { email: newAdminEmail } });

    const hashedAdminPassword = await bcrypt.hash(newAdminPassword, 10);
    await User.create({
      email: newAdminEmail,
      password: hashedAdminPassword,
      firstName: 'New',
      lastName: 'Administrator',
      userType: 'sys_admin',
      isActive: true,
      isVerified: true
    });

    console.log('✓ New Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', newAdminEmail);
    console.log('Password:', newAdminPassword);
    console.log('Role:', 'System Administrator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // New HR Manager Account
    const newHREmail = 'newhrmanager@huntjob.com';
    const newHRPassword = 'NewHR@2024';

    // Check and delete if exists
    await User.destroy({ where: { email: newHREmail } });

    const hashedHRPassword = await bcrypt.hash(newHRPassword, 10);
    await User.create({
      email: newHREmail,
      password: hashedHRPassword,
      firstName: 'New',
      lastName: 'HR Manager',
      userType: 'hr_admin',
      isActive: true,
      isVerified: true
    });

    console.log('\n✓ New HR Manager account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', newHREmail);
    console.log('Password:', newHRPassword);
    console.log('Role:', 'HR Administrator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error creating accounts:', error.message);
  } finally {
    await sequelize.close();
  }
}

createNewAccounts();
