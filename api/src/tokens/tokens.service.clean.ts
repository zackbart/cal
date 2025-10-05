import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CalUser {
  id: number;
  username: string;
  email: string;
  name: string;
}

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  private readonly calApiUrl: string;
  private readonly calClientId: string;
  private readonly calClientSecret: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.calApiUrl = this.configService.get<string>('CAL_API_URL', 'https://api.cal.com');
    this.calClientId = this.configService.get<string>('CAL_CLIENT_ID');
    this.calClientSecret = this.configService.get<string>('CAL_CLIENT_SECRET');
    
    this.logger.log('TokensService initialized', {
      calApiUrl: this.calApiUrl,
      hasClientId: !!this.calClientId,
      hasClientSecret: !!this.calClientSecret,
      clientIdLength: this.calClientId?.length || 0
    });
  }

  async getManagedUserToken(username: string): Promise<{ accessToken: string; expiresAt: string }> {
    this.logger.log('Looking up existing Cal.com user', { username });
    
    try {
      // 1. Look up existing user in Cal.com platform
      const existingUser = await this.getExistingCalUser(username);
      
      if (!existingUser) {
        throw new NotFoundException(`User '${username}' not found. Please check the username or contact support.`);
      }
      
      // 2. Generate a simple token for the existing user
      const tokenResponse = {
        access_token: `user_token_${existingUser.id}_${Date.now()}`,
        expires_in: 3600 // 1 hour
      };
      
      // 3. Return the access token with expiration
      const expiresAt = new Date(Date.now() + (tokenResponse.expires_in * 1000)).toISOString();
      
      this.logger.log('Successfully generated user token', { 
        username, 
        userId: existingUser.id,
        expiresAt 
      });
      
      return {
        accessToken: tokenResponse.access_token,
        expiresAt
      };
      
    } catch (error) {
      this.logger.error('Failed to generate user token', { 
        username, 
        error: error.message 
      });
      throw error;
    }
  }

  private async getExistingCalUser(username: string): Promise<any> {
    try {
      // Get client access token first
      const clientToken = await this.getClientAccessToken();
      
      // Look up user by username in Cal.com platform
      const response = await fetch(`${this.calApiUrl}/v2/users/username/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${clientToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // User not found
        }
        throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      this.logger.log('Found existing Cal.com user', { 
        username, 
        userId: userData.id,
        email: userData.email 
      });
      
      return userData;
    } catch (error) {
      this.logger.error('Error looking up existing Cal.com user', { 
        username, 
        error: error.message 
      });
      return null;
    }
  }

  private async getClientAccessToken(): Promise<string> {
    try {
      const response = await fetch(`${this.calApiUrl}/v2/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-cal-client-id': this.calClientId,
          'x-cal-secret-key': this.calClientSecret,
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.calClientId,
          client_secret: this.calClientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get client access token: ${response.status} ${response.statusText}`);
      }

      const tokenData = await response.json();
      return tokenData.access_token;
    } catch (error) {
      this.logger.error('Failed to get client access token', { error: error.message });
      throw error;
    }
  }
}
