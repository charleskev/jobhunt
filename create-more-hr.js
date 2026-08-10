import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

async function createMoreHRAccounts() {
  try {
    await sequelize.sync();

    const accounts = [
      { email: 'hr2@huntjob.com', password: 'HR2Pass123', firstName: 'HR', lastName: 'Two' },
      { email: 'hr3@huntjob.com', password: 'HR3Pass123', firstName: 'HR', lastName: 'Three' },
      { email: 'hr4@huntjob.com', password: 'HR4Pass123', firstName: 'HR', lastName: 'Four' },
      { email: 'hr5@huntjob.com', password: 'HR5Pass123', firstName: 'HR', lastName: 'Five' }
    ];

    for (const acc of accounts) {
      await User.destroy({ where: { email: acc.email } });
      const hashed = await bcrypt.hash(acc.password, 10);
      await User.create({
        email: acc.email,
        password: hashed,
        firstName: acc.firstName,
        lastName: acc.lastName,
        userType: 'hr_admin',
        isActive: true,
        isVerified: true
      });
      console.log(`✓ ${acc.firstName} ${acc.lastName} created`);
      console.log(`  Email: ${acc.email}`);
      console.log(`  Password: ${acc.password}\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('All HR accounts created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createMoreHRAccounts();
