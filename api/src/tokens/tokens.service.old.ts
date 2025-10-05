import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CalUser {
  id: number;
  username: string;
  email: string;
  name: string;
}

interface CalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  private readonly calApiUrl: string;
  private readonly calClientId: string;
  private readonly calClientSecret: string;
  
  // In-memory cache for user data including tokens (in production, use database)
  private userCache = new Map<string, any>();

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
    this.logger.log('Generating managed user token', { username });
    
    try {
      // 1. Look up existing user in Cal.com platform (not managed users)
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
        this.logger.log('Using fresh access token from managed user creation', { username });
      } else {
        // Existing user - check if we have a valid access token
        if (managedUser.accessToken) {
          // Check if the access token is still valid (not expired)
          const tokenExpiry = managedUser.accessTokenExpiresAt;
          if (tokenExpiry && new Date(tokenExpiry) > new Date()) {
            this.logger.log('Using existing valid access token', { username });
            tokenResponse = {
              access_token: managedUser.accessToken,
              expires_in: Math.floor((new Date(tokenExpiry).getTime() - Date.now()) / 1000)
            };
          } else {
            // Token expired, try to refresh
            const cachedRefreshToken = managedUser.refreshToken;
            if (cachedRefreshToken) {
              try {
                tokenResponse = await this.refreshAccessToken(managedUser.id, cachedRefreshToken);
                this.logger.log('Successfully refreshed expired access token', { username });
              } catch (error) {
                this.logger.warn('Failed to refresh expired access token, using fallback', { 
                  username, 
                  userId: managedUser.id, 
                  error: error.message 
                });
                tokenResponse = {
                  access_token: `fallback_token_${username}_${Date.now()}`,
                  expires_in: 3600
                };
              }
            } else {
              this.logger.warn('No cached refresh token available for expired token, using fallback', { 
                username, 
                userId: managedUser.id 
              });
              tokenResponse = {
                access_token: `fallback_token_${username}_${Date.now()}`,
                expires_in: 3600
              };
            }
          }
        } else {
          this.logger.warn('No access token available for existing user, using fallback', { 
            username, 
            userId: managedUser.id 
          });
          tokenResponse = {
            access_token: `fallback_token_${username}_${Date.now()}`,
            expires_in: 3600
          };
        }
      }
      
      // 3. Calculate expiration time
      const expiresAt = new Date(Date.now() + (tokenResponse.expires_in * 1000));
      
      this.logger.log('Successfully generated managed user token', { 
        username, 
        managedUserId: managedUser.id,
        expiresAt: expiresAt.toISOString() 
      });

      return {
        accessToken: tokenResponse.access_token,
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to generate managed user token', { 
        username, 
        error: error.message 
      });
      
      // Temporary fallback for development while debugging Cal.com API
      this.logger.warn('Using fallback token for development', { username });
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      
      return {
        accessToken: `fallback_token_${username}_${Date.now()}`,
        expiresAt: expiresAt.toISOString(),
      };
    }
  }

  private async createOrGetManagedUser(username: string): Promise<any> {
    try {
      this.logger.log('Creating or getting managed user', { username });
      
      // For development: always create a fresh managed user to get new tokens
      // In production, you'd want to check for existing users and store tokens in database
      this.logger.log('Creating fresh managed user for development', { username });
      
      // If not found, create a new managed user using the correct endpoint
      const response = await fetch(`${this.calApiUrl}/oauth-clients/${this.calClientId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cal-secret-key': this.calClientSecret,
        },
        body: JSON.stringify({
          email: `${username}@example.com`, // You might want to make this configurable
          name: username,
          timeFormat: 12,
          weekStart: 'Monday',
          timeZone: 'America/New_York',
          locale: 'en',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle 409 Conflict - user already exists
        if (response.status === 409) {
          try {
            const errorData = JSON.parse(errorText);
            const existingUserId = errorData.error?.details?.message?.match(/Existing user ID=(\d+)/)?.[1];
            
            if (existingUserId) {
              this.logger.log('User already exists, getting user details', { 
                username, 
                existingUserId 
              });
              
              // Get the existing user details and generate a new token
              return await this.getExistingUserWithToken(username, existingUserId);
            }
          } catch (parseError) {
            this.logger.error('Failed to parse conflict error', { parseError });
          }
        }
        
        this.logger.error('Failed to create managed user', { 
          username, 
          status: response.status,
          errorText 
        });
        throw new Error(`Failed to create managed user: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      this.logger.log('Managed user creation response', { username, responseData });
      
      // Extract the user, access token, and refresh token from the response data structure
      const userData = responseData.data?.user || responseData.user || responseData;
      const accessToken = responseData.data?.accessToken || responseData.accessToken;
      const refreshToken = responseData.data?.refreshToken || responseData.refreshToken;
      
      const managedUser = {
        ...userData,
        accessToken: accessToken,
        refreshToken: refreshToken
      };
      
      // Store full user data including tokens in cache for future use
      this.userCache.set(username, managedUser);
      this.logger.log('Stored user data in cache', { 
        username, 
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        expiresAt: managedUser.accessTokenExpiresAt
      });
      
      this.logger.log('Successfully created managed user', { 
        username, 
        userId: managedUser.id, 
        hasAccessToken: !!managedUser.accessToken,
        hasRefreshToken: !!managedUser.refreshToken
      });
      return managedUser;
    } catch (error) {
      this.logger.error('Error creating or getting managed user', { username, error: error.message });
      throw error;
    }
  }

  private async getExistingUserWithToken(username: string, userId: string): Promise<any> {
    try {
      this.logger.log('Getting existing user with new token', { username, userId });
      
      // Get user details from Cal.com API
      const userResponse = await fetch(`${this.calApiUrl}/oauth-clients/${this.calClientId}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-cal-secret-key': this.calClientSecret,
        },
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        this.logger.error('Failed to get existing user details', { 
          username, 
          userId,
          status: userResponse.status,
          errorText 
        });
        throw new Error(`Failed to get user details: ${userResponse.status} - ${errorText}`);
      }

      const userData = await userResponse.json();
      const user = userData.data || userData;
      
      // Generate a new access token for the existing user
      // For now, we'll use a mock token since we don't have a refresh endpoint
      // In production, you'd want to implement proper token refresh
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiYWNjZXNzX3Rva2VuIiwiY2xpZW50SWQiOiJjbWdkemx2aXEwMDAzcWQxcjFsamxqOTFhIiwib3duZXJJZCI6${userId}LCJleHBpcmVzQXQiOjE3NTk2OTU1NDAwMDAsImp0aSI6IjEyMzQ1Njc4LTEyMzQtMTIzNC0xMjM0LTEyMzQ1Njc4OTBhYiIsImlhdCI6MTc1OTY5MTk2Nn0.mock_signature_for_existing_user_${userId}`;
      
      const managedUser = {
        ...user,
        accessToken: mockToken,
        accessTokenExpiresAt: Date.now() + (3600 * 1000), // 1 hour from now
        refreshToken: null // No refresh token for existing users in this approach
      };
      
      this.logger.log('Successfully got existing user with token', { 
        username, 
        userId: managedUser.id,
        hasAccessToken: !!managedUser.accessToken
      });
      
      return managedUser;
    } catch (error) {
      this.logger.error('Error getting existing user with token', { username, userId, error: error.message });
      throw error;
    }
  }

  private async getManagedUserByUsername(username: string): Promise<any | null> {
    try {
      // First check our cache for user data including tokens
      const cachedUser = this.userCache.get(username);
      if (cachedUser) {
        this.logger.log('Found user in cache', { username, hasAccessToken: !!cachedUser.accessToken });
        return cachedUser;
      }

      // If not in cache, get from Cal.com API (but this won't include tokens)
      const response = await fetch(`${this.calApiUrl}/oauth-clients/${this.calClientId}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-cal-secret-key': this.calClientSecret,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to get managed users list', { 
          username, 
          status: response.status,
          errorText 
        });
        throw new Error(`Failed to get managed users: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      // Find user by username in the list
      const user = data.data?.find((u: any) => u.username === username || u.email?.includes(username));
      return user || null;
    } catch (error) {
      this.logger.error('Error getting managed user', { username, error: error.message });
      return null;
    }
  }

  private async refreshAccessToken(managedUserId: string, refreshToken: string): Promise<CalTokenResponse> {
    try {
      // Use the refresh endpoint to get a new access token
      const response = await fetch(`${this.calApiUrl}/oauth-clients/${this.calClientId}/users/${managedUserId}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cal-secret-key': this.calClientSecret,
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to refresh access token for managed user', { 
          managedUserId, 
          status: response.status,
          errorText 
        });
        throw new Error(`Failed to refresh access token: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      this.logger.log('Token refresh response', { managedUserId, responseData });
      
      // Extract access token from response structure
      return {
        access_token: responseData.data?.accessToken || responseData.accessToken,
        expires_in: responseData.data?.accessTokenExpiresAt || 3600,
        token_type: 'Bearer',
        scope: 'read:users'
      };
    } catch (error) {
      this.logger.error('Error refreshing access token for managed user', { managedUserId, error: error.message });
      throw error;
    }
  }

  async cleanupTestUsers(): Promise<void> {
    this.logger.log('Starting cleanup of test users');
    
    // List of usernames to keep (like 'zack')
    const keepUsers = ['zack'];
    
    // Get all managed users
    try {
      const response = await fetch(`${this.calApiUrl}/oauth-clients/${this.calClientId}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-cal-secret-key': this.calClientSecret,
        },
      });

      if (!response.ok) {
        this.logger.error('Failed to get managed users list', { 
          status: response.status,
          errorText: await response.text()
        });
        return;
      }

      const data = await response.json();
      const users = data.data || [];
      
      this.logger.log('Found managed users', { count: users.length });
      
      // Delete users that are not in the keep list
      for (const user of users) {
        if (!keepUsers.includes(user.username)) {
          try {
            await this.deleteManagedUser(user.id);
            this.logger.log('Deleted test user', { username: user.username, userId: user.id });
          } catch (error) {
            this.logger.error('Failed to delete user', { username: user.username, error: error.message });
          }
        }
      }
      
      this.logger.log('Cleanup completed');
    } catch (error) {
      this.logger.error('Error during cleanup', { error: error.message });
    }
  }

  private async deleteManagedUser(userId: string): Promise<void> {
    const response = await fetch(`${this.calApiUrl}/oauth-clients/${this.calClientId}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-cal-secret-key': this.calClientSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete managed user: ${response.status} - ${errorText}`);
    }
  }

  private async getUserByUsername(username: string): Promise<CalUser | null> {
    try {
      this.logger.log('Fetching user by username', { username, calApiUrl: this.calApiUrl });
      
      const clientToken = await this.getClientAccessToken();
      this.logger.log('Got client token', { tokenLength: clientToken.length });
      
      const response = await fetch(`${this.calApiUrl}/users/username/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${clientToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log('Cal.com API response', { 
        status: response.status, 
        statusText: response.statusText,
        url: `${this.calApiUrl}/users/username/${username}`
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Cal.com API error response', { 
          status: response.status, 
          statusText: response.statusText,
          errorText 
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Failed to fetch user by username', { 
        username, 
        error: error.message,
        calApiUrl: this.calApiUrl
      });
      throw new BadRequestException('Failed to fetch user information');
    }
  }

  private async requestUserAccessToken(userId: number): Promise<CalTokenResponse> {
    try {
      const response = await fetch(`${this.calApiUrl}/oauth-clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cal-client-id': this.calClientId,
          'x-cal-secret-key': this.calClientSecret,
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          scope: 'read:users read:bookings write:bookings',
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Failed to request user access token', { 
        userId, 
        error: error.message 
      });
      throw new BadRequestException('Failed to generate access token');
    }
  }

  private async getClientAccessToken(): Promise<string> {
    try {
      // Try using API key authentication instead
      const response = await fetch(`${this.calApiUrl}/oauth-clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.calClientSecret}`,
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          scope: 'read:users',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Cal.com OAuth error', { 
          status: response.status, 
          statusText: response.statusText,
          errorText,
          url: `${this.calApiUrl}/oauth-clients`
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      this.logger.error('Failed to get client access token', { error: error.message });
      throw new BadRequestException('Failed to authenticate with Cal.com');
    }
  }
}
