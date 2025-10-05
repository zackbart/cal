import { Worker } from 'bullmq';
import { Connection } from 'typeorm';
import { createConnection } from 'typeorm';

// Worker jobs
import { jitValidateSlot } from './jobs/jit-validate-slot';
import { sendReminder } from './jobs/send-reminder';
import { generateSummary } from './jobs/generate-summary';
import { purgeSensitive } from './jobs/purge-sensitive';

async function startWorkers() {
  console.log('Starting ChurchHub workers...');

  // Database connection
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [], // TODO: Add entity imports
    synchronize: process.env.NODE_ENV !== 'production',
  });

  // Redis connection for BullMQ
  const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  };

  // Start workers
  const workers = [
    new Worker('jit-validate-slot', jitValidateSlot, {
      connection: redisConnection,
      concurrency: 5,
    }),
    new Worker('send-reminder', sendReminder, {
      connection: redisConnection,
      concurrency: 10,
    }),
    new Worker('generate-summary', generateSummary, {
      connection: redisConnection,
      concurrency: 3,
    }),
    new Worker('purge-sensitive', purgeSensitive, {
      connection: redisConnection,
      concurrency: 1,
    }),
  ];

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down workers...');
    await Promise.all(workers.map(worker => worker.close()));
    await connection.close();
    process.exit(0);
  });

  console.log('Workers started successfully');
}

startWorkers().catch(console.error);
