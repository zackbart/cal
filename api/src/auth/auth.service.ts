import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from '../tokens/tokens.service';

export interface PastorPayload {
  sub: string; // pastor username
  username: string;
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  pastor: {
    username: string;
    email: string;
    userId: number;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  // In production, store refresh tokens in database
  private refreshTokens = new Map<string, { username: string; expiresAt: Date }>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly tokensService: TokensService,
  ) {}

  async validatePastor(username: string, password: string): Promise<any> {
    this.logger.log('Validating pastor credentials', { username });
    
    // Check if pastor exists as managed user
    const managedUser = await this.tokensService.getExistingManagedUser(username);
    
    if (!managedUser) {
      this.logger.warn('Pastor not found in managed users', { username });
      throw new UnauthorizedException('Invalid credentials');
    }

    // For now, we'll use a simple password check
    // In production, you'd want to hash passwords and store them securely
    // This could be integrated with your existing user management system
    const isValidPassword = await this.validatePassword(username, password);
    
    if (!isValidPassword) {
      this.logger.warn('Invalid password for pastor', { username });
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log('Pastor credentials validated successfully', { 
      username, 
      userId: managedUser.id 
    });

    return {
      username: managedUser.username,
      email: managedUser.email,
      userId: managedUser.id,
    };
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const pastor = await this.validatePastor(username, password);
    
    const payload: PastorPayload = {
      sub: pastor.username,
      username: pastor.username,
      userId: pastor.userId,
      email: pastor.email,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken(pastor.username);

    this.logger.log('Pastor logged in successfully', { 
      username: pastor.username,
      userId: pastor.userId 
    });

    return {
      accessToken,
      refreshToken,
      pastor: {
        username: pastor.username,
        email: pastor.email,
        userId: pastor.userId,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const tokenData = this.refreshTokens.get(refreshToken);
    
    if (!tokenData || tokenData.expiresAt < new Date()) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Get fresh pastor data
    const managedUser = await this.tokensService.getExistingManagedUser(tokenData.username);
    
    if (!managedUser) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('Pastor no longer exists');
    }

    const payload: PastorPayload = {
      sub: managedUser.username,
      username: managedUser.username,
      userId: managedUser.id,
      email: managedUser.email,
    };

    const accessToken = this.jwtService.sign(payload);
    
    this.logger.log('Access token refreshed', { username: tokenData.username });
    
    return { accessToken };
  }

  async logout(refreshToken: string): Promise<void> {
    this.refreshTokens.delete(refreshToken);
    this.logger.log('Pastor logged out', { refreshToken: refreshToken.substring(0, 10) + '...' });
  }

  private generateRefreshToken(username: string): string {
    const refreshToken = this.jwtService.sign(
      { sub: username, type: 'refresh' },
      { expiresIn: '30d' } // 30 days for refresh token
    );
    
    // Store refresh token with expiration
    this.refreshTokens.set(refreshToken, {
      username,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    
    return refreshToken;
  }

  private async validatePassword(username: string, password: string): Promise<boolean> {
    // TODO: Implement proper password validation
    // For now, using a simple check - in production you'd want:
    // 1. Hash passwords with bcrypt
    // 2. Store hashed passwords in database
    // 3. Compare hashed password with input
    
    // Temporary: allow any password for existing managed users
    // In production, you'd integrate with your user management system
    return password.length >= 6; // Basic validation for demo
  }

  // Clean up expired refresh tokens (call this periodically)
  cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.expiresAt < now) {
        this.refreshTokens.delete(token);
      }
    }
  }
}
