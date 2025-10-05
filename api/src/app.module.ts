import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { TokensModule } from './tokens/tokens.module';
import { FormsModule } from './forms/forms.module';
import { BookingsModule } from './bookings/bookings.module';
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
    TokensModule,
    FormsModule,
    BookingsModule,
  ],
})
export class AppModule {}
