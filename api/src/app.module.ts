import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { FormsModule } from './forms/forms.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';
import { PastorsModule } from './pastors/pastors.module';
import { AdminModule } from './admin/admin.module';
import * as entities from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Only load database if DATABASE_URL is provided
    ...(process.env.DATABASE_URL ? [
      TypeOrmModule.forRoot({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: Object.values(entities),
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        retryAttempts: 3,
        retryDelay: 3000,
        autoLoadEntities: true,
      })
    ] : []),
    HealthModule,
    WebhooksModule,
    FormsModule,
    BookingsModule,
    AuthModule,
    PastorsModule,
    AdminModule,
  ],
})
export class AppModule {}
