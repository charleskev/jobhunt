import bcrypt from 'bcrypt';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

async function createHR20Accounts() {
  try {
    await sequelize.sync();

    const password = 'Hr@123456';
    const accounts = [
      { email: 'hr20_1@huntjob.com', firstName: 'HR', lastName: '2.0 One', department: 'General' },
      { email: 'hr20_2@huntjob.com', firstName: 'HR', lastName: '2.0 Two', department: 'IT' },
      { email: 'hr20_3@huntjob.com', firstName: 'HR', lastName: '2.0 Three', department: 'Finance' },
      { email: 'hr20_4@huntjob.com', firstName: 'HR', lastName: '2.0 Four', department: 'HR' }
    ];

    console.log('\n✓ HR 2.0 Accounts Created with Password: Hr@123456\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const acc of accounts) {
      await User.destroy({ where: { email: acc.email } });
      const hashed = await bcrypt.hash(password, 10);
      await User.create({
        email: acc.email,
        password: hashed,
        firstName: acc.firstName,
        lastName: acc.lastName,
        userType: 'dept_manager',
        department: acc.department,
        isActive: true,
        isVerified: true
      });
      console.log(`Email: ${acc.email}`);
      console.log(`Password: ${password}`);
      console.log(`Role: Department Manager`);
      console.log(`Department: ${acc.department}`);
      console.log(`Dashboard: /hr2.0/dashboard\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createHR20Accounts();
