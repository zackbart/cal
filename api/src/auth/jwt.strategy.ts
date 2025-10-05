import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, PastorPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
        (request) => {
          // Extract JWT from cookies
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key'),
    });
  }

  async validate(payload: PastorPayload): Promise<PastorPayload> {
    // Verify that the pastor still exists as a managed user
    const managedUser = await this.authService['tokensService'].getExistingManagedUser(payload.username);
    
    if (!managedUser) {
      throw new UnauthorizedException('Pastor no longer exists');
    }

    // Return the pastor payload
    return {
      sub: payload.sub,
      username: payload.username,
      userId: payload.userId,
      email: payload.email,
    };
  }
}
