import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { StackAuthService } from './stack-auth.service';
import { StackAuthController } from './stack-auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { CalLookupService } from '../tokens/cal-lookup.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: { 
          expiresIn: '7d', // 7 days for access token
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, StackAuthService, JwtStrategy, CalLookupService],
  controllers: [AuthController, StackAuthController],
  exports: [AuthService],
})
export class AuthModule {}
