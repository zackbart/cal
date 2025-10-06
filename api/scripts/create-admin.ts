import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get(getRepositoryToken(User));

  const adminEmail = 'zackerybartolome@gmail.com';
  const adminPassword = 'password';

  try {
    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', adminEmail);
      console.log('   Role:', existingAdmin.role);
      console.log('   ID:', existingAdmin.id);
      
      // Update the password with a fresh hash
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.username = 'admin';
      existingAdmin.displayName = 'ChurchHub Cal Administrator';
      existingAdmin.isActive = true;
      existingAdmin.preferences = {
        bio: 'ChurchHub Cal Administrator',
        churchName: 'ChurchHub Cal',
        timezone: 'America/New_York',
        notifications: {
          email: true,
          sms: false
        }
      };
      
      await userRepository.save(existingAdmin);
      console.log('✅ Admin user password updated successfully!');
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const adminUser = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      username: 'admin',
      firstName: 'Zackery',
      lastName: 'Bartolome',
      isActive: true,
      preferences: {
        bio: 'ChurchHub Cal Administrator',
        churchName: 'ChurchHub Cal',
        timezone: 'America/New_York',
        notifications: {
          email: true,
          sms: false
        }
      }
    });

    const savedAdmin = await userRepository.save(adminUser);

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', savedAdmin.email);
    console.log('   Role:', savedAdmin.role);
    console.log('   ID:', savedAdmin.id);
    console.log('   Username:', savedAdmin.username);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await app.close();
  }
}

createAdmin();
