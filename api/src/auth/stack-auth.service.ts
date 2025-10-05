import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CalLookupService } from '../tokens/cal-lookup.service';

@Injectable()
export class StackAuthService {
  private readonly logger = new Logger(StackAuthService.name);
  private readonly stackProjectId: string;
  private readonly stackSecretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly calLookupService: CalLookupService,
  ) {
    this.stackProjectId = this.configService.get<string>('STACK_PROJECT_ID');
    this.stackSecretKey = this.configService.get<string>('STACK_SECRET_SERVER_KEY');
  }

  async validateStackUser(stackUserId: string): Promise<any> {
    try {
      this.logger.log('Validating Stack user', { stackUserId });

      // Verify the Stack user exists and is valid
      const response = await fetch(`https://api.stack-auth.com/api/v1/projects/${this.stackProjectId}/users/${stackUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.stackSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.warn('Stack user validation failed', { 
          stackUserId, 
          status: response.status 
        });
        throw new UnauthorizedException('Invalid user');
      }

      const user = await response.json();
      this.logger.log('Stack user validated successfully', { 
        stackUserId, 
        email: user.primaryEmail 
      });

      return user;
    } catch (error) {
      this.logger.error('Error validating Stack user', { 
        stackUserId, 
        error: error.message 
      });
      throw new UnauthorizedException('User validation failed');
    }
  }

  async getCalTokenForStackUser(stackUserId: string): Promise<any> {
    try {
      // First validate the Stack user exists
      const stackUser = await this.validateStackUser(stackUserId);
      
      // Look up existing Cal.com user and generate token
      // This assumes the Cal.com user already exists (created manually)
      const calResult = await this.calLookupService.lookupUserAndGenerateToken(stackUserId);
      
      this.logger.log('Generated Cal.com token for Stack user', { 
        stackUserId, 
        email: stackUser.primaryEmail,
        calUserId: calResult.user.id
      });

      return {
        accessToken: calResult.accessToken,
        expiresAt: calResult.expiresAt,
        user: {
          id: stackUserId,
          email: stackUser.primaryEmail,
          displayName: stackUser.displayName,
          calUserId: calResult.user.id,
        }
      };
    } catch (error) {
      this.logger.error('Error getting Cal.com token for Stack user', { 
        stackUserId, 
        error: error.message 
      });
      throw error;
    }
  }

}
