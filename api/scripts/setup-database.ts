#!/usr/bin/env ts-node

import { createConnection } from 'typeorm';
import * as entities from '../src/entities';

async function setupDatabase() {
  console.log('Setting up ChurchHub database...');

  try {
    const connection = await createConnection({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: Object.values(entities),
      synchronize: true, // Only for initial setup
      logging: true,
    });

    console.log('✅ Database connection established');
    console.log('✅ Tables created/updated');

    // Create initial data if needed
    await createInitialData(connection);

    await connection.close();
    console.log('✅ Database setup complete');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

async function createInitialData(connection: any) {
  console.log('Creating initial data...');
  
  // TODO: Add any initial data creation here
  // For example, default forms, policies, etc.
  
  console.log('✅ Initial data created');
}

// Run if called directly
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };
