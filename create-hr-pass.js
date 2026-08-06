import bcrypt from 'bcrypt';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

async function createHRWithPassword() {
  try {
    await sequelize.sync();

    const password = 'Hr@123456';
    const accounts = [
      { email: 'hr2@huntjob.com', firstName: 'HR', lastName: 'Two' },
      { email: 'hr3@huntjob.com', firstName: 'HR', lastName: 'Three' },
      { email: 'hr4@huntjob.com', firstName: 'HR', lastName: 'Four' },
      { email: 'hr5@huntjob.com', firstName: 'HR', lastName: 'Five' }
    ];

    console.log('\n✓ HR Accounts Created with Password: Hr@123456\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const acc of accounts) {
      await User.destroy({ where: { email: acc.email } });
      const hashed = await bcrypt.hash(password, 10);
      await User.create({
        email: acc.email,
        password: hashed,
        firstName: acc.firstName,
        lastName: acc.lastName,
        userType: 'hr_admin',
        isActive: true,
        isVerified: true
      });
      console.log(`Email: ${acc.email}`);
      console.log(`Password: ${password}`);
      console.log(`Role: HR Administrator\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createHRWithPassword();
