import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PastorsController } from './pastors.controller';
import { PastorsService } from './pastors.service';
import { User } from '../entities/user.entity';
import { Booking } from '../entities/booking.entity';
import { CalLookupService } from '../tokens/cal-lookup.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Booking]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PastorsController],
  providers: [PastorsService, CalLookupService, JwtAuthGuard],
  exports: [PastorsService],
})
export class PastorsModule {}
