import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

interface CalUser {
  id: number;
  username: string;
  email: string;
  name: string;
}

@Injectable()
export class CalLookupService {
  private readonly logger = new Logger(CalLookupService.name);
  private readonly calApiUrl: string;
  private readonly calClientId: string;
  private readonly calClientSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.calApiUrl = this.configService.get<string>('CAL_API_URL', 'https://api.cal.com');
    this.calClientId = this.configService.get<string>('CAL_CLIENT_ID');
    this.calClientSecret = this.configService.get<string>('CAL_CLIENT_SECRET');
    
    this.logger.log('CalLookupService initialized', {
      calApiUrl: this.calApiUrl,
      hasClientId: !!this.calClientId,
      hasClientSecret: !!this.calClientSecret,
    });
  }

  /**
   * Look up an existing Cal.com user by username and generate a token
   * This is a lookup-only service - no user creation or management
   */
  async lookupUserAndGenerateToken(username: string): Promise<{ accessToken: string; expiresAt: string; user: CalUser }> {
    this.logger.log('Looking up Cal.com user', { username });
    
    try {
      // 1. Look up existing user in Cal.com platform
      const existingUser = await this.findCalUser(username);
      
      if (!existingUser) {
        throw new NotFoundException(`Cal.com user '${username}' not found. User must be created manually in Cal.com first.`);
      }
      
      // 2. Generate a proper JWT token for the existing user
      const payload = { 
        email: existingUser.email, 
        sub: existingUser.id.toString(), 
        role: 'user',
        calUserId: existingUser.id,
        username: existingUser.username
      };
      
      const accessToken = this.jwtService.sign(payload);
      
      // 3. Return the access token with expiration (JWT tokens have built-in expiration)
      const expiresAt = new Date(Date.now() + (3600 * 1000)).toISOString(); // 1 hour
      
      this.logger.log('Successfully generated token for Cal.com user', { 
        username, 
        userId: existingUser.id,
        expiresAt 
      });
      
      return {
        accessToken,
        expiresAt,
        user: existingUser
      };
      
    } catch (error) {
      this.logger.error('Failed to lookup Cal.com user', { 
        username, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Find an existing Cal.com user by username
   * Supports both exact match and partial match for managed users
   */
  private async findCalUser(username: string): Promise<CalUser | null> {
    try {
      // Get client access token first
      const clientToken = await this.getClientAccessToken();
      
      // Try to find user by username in Cal.com platform
      const response = await fetch(`${this.calApiUrl}/v2/users/username/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${clientToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        this.logger.log('Found Cal.com user by username', { 
          username, 
          userId: userData.id,
          email: userData.email 
        });
        return userData;
      }

      // If not found by username, try managed users lookup
      if (response.status === 404) {
        return await this.findManagedUser(username, clientToken);
      }

      throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      this.logger.error('Error looking up Cal.com user', { 
        username, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Look up managed users as fallback
   */
  private async findManagedUser(username: string, clientToken: string): Promise<CalUser | null> {
    try {
      this.logger.log('Looking up managed users as fallback', { username });
      
      // Look up managed user by username using direct API call
      const response = await fetch(`${this.calApiUrl}/v2/oauth-clients/${this.calClientId}/users`, {
        method: 'GET',
        headers: {
          'x-cal-client-id': this.calClientId,
          'x-cal-secret-key': this.calClientSecret,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.warn('Failed to fetch managed users', { 
          status: response.status, 
          statusText: response.statusText
        });
        return null;
      }

      const data = await response.json();
      const users = data.data || [];
      
      this.logger.log('Fetched managed users', { 
        count: users.length, 
        usernames: users.map((u: any) => u.username)
      });
      
      // Find user by username in the list - handle both exact match and partial match
      const user = users.find((u: any) => {
        // Exact username match
        if (u.username === username) return true;
        
        // Check if the managed user username contains the requested username
        // e.g., "zack" should match "zack-cmgdzlviq0003qd1r1ljlj91a-example-com"
        if (u.username && u.username.startsWith(username + '-')) return true;
        
        // Check email for username
        if (u.email && u.email.includes(username)) return true;
        
        return false;
      });
      
      if (user) {
        this.logger.log('Found managed user', { 
          username, 
          userId: user.id,
          email: user.email,
          actualUsername: user.username
        });
        return user;
      }
      
      this.logger.log('User not found in managed users list', { 
        username, 
        availableUsernames: users.map((u: any) => u.username)
      });
      return null;
      
    } catch (error) {
      this.logger.error('Error looking up managed user', { 
        username, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Get client access token for Cal.com API
   */
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

  /**
   * Get event types for a Cal.com user
   */
  async getEventTypes(calUserId: number): Promise<any[]> {
    try {
      const clientToken = await this.getClientAccessToken();
      
      const response = await fetch(`${this.calApiUrl}/v2/event-types?userId=${calUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${clientToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.warn('Failed to fetch event types', { 
          calUserId,
          status: response.status, 
          statusText: response.statusText
        });
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      this.logger.error('Error fetching event types', { 
        calUserId, 
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Get availability for a Cal.com user
   */
  async getAvailability(
    calUserId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    try {
      const clientToken = await this.getClientAccessToken();
      
      const params = new URLSearchParams({
        userId: calUserId.toString(),
      });
      
      if (startDate) {
        params.append('start', startDate.toISOString());
      }
      if (endDate) {
        params.append('end', endDate.toISOString());
      }
      
      const response = await fetch(`${this.calApiUrl}/v2/availability?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${clientToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.warn('Failed to fetch availability', { 
          calUserId,
          status: response.status, 
          statusText: response.statusText
        });
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      this.logger.error('Error fetching availability', { 
        calUserId, 
        error: error.message 
      });
      return [];
    }
  }
}
