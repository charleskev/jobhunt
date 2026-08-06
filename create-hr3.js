import bcrypt from 'bcrypt';
import { User } from './models/User.js';
import { sequelize } from './models/db.js';

async function createHR3Account() {
  try {
    await sequelize.sync();

    // Remove existing if present
    await User.destroy({ where: { email: 'hr3@huntjob.com' } });

    const email = 'hr3@huntjob.com';
    const password = 'Hr3!Pass2026';

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email: email,
      password: hashedPassword,
      firstName: 'HR',
      lastName: 'Three',
      userType: 'hr_admin',
      isActive: true,
      isVerified: true
    });

    console.log('\n✓ HR 3 account created!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role: HR Administrator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createHR3Account();
