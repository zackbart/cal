import { cookies } from 'next/headers';

export interface Pastor {
  username: string;
  email: string;
  userId: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  pastor: Pastor;
}

export class AuthService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  static async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  static async logout(): Promise<void> {
    await fetch(`${this.API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  static async refreshToken(): Promise<{ accessToken: string }> {
    const response = await fetch(`${this.API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  static async getCurrentPastor(): Promise<Pastor | null> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        username: data.username,
        email: data.email,
        userId: data.userId,
      };
    } catch (error) {
      return null;
    }
  }

  static async verifyToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/verify`, {
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Server-side auth utilities
export async function getServerSideAuth(): Promise<Pastor | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    
    if (!accessToken) {
      return null;
    }

    const response = await fetch(`${AuthService.API_BASE}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.pastor;
  } catch (error) {
    return null;
  }
}
