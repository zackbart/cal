import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { StackAuthService } from './stack-auth.service';
import { StackAuthController } from './stack-auth.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CalLookupService } from '../tokens/cal-lookup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') || '1h'
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [StackAuthService, AuthService, CalLookupService],
  controllers: [StackAuthController, AuthController],
  exports: [StackAuthService, AuthService],
})
export class AuthModule {}
