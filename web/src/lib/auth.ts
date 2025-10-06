import { create } from "zustand";
import { persist } from "zustand-persist";

export interface User {
  id: string;
  email: string;
  name: string;
  churchName: string;
  role: "pastor" | "admin";
  calUserId: string;
  calUsername: string;
  schedulingLink: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: true }),
      
      setTokens: (accessToken, refreshToken) => 
        set({ accessToken, refreshToken }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }),
      
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: "churchhub-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Auth API functions
export const authApi = {
  async signup(data: {
    email: string;
    name: string;
    password: string;
    churchName: string;
    bio?: string;
    schedulingUsername?: string;
  }) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Signup failed");
    }

    return response.json();
  },

  async login(data: { email: string; password: string }) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },

  async refreshToken(refreshToken: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/cal/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    return response.json();
  },

  async logout() {
    const { accessToken } = useAuthStore.getState();
    
    if (accessToken) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  },
};

// Auth hooks
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    ...store,
    login: async (email: string, password: string) => {
      try {
        store.setLoading(true);
        store.clearError();
        
        const response = await authApi.login({ email, password });
        store.login(response.user, response.accessToken, response.refreshToken);
        
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Login failed";
        store.setError(errorMessage);
        throw error;
      } finally {
        store.setLoading(false);
      }
    },
    
    signup: async (data: {
      email: string;
      name: string;
      password: string;
      churchName: string;
      bio?: string;
      schedulingUsername?: string;
    }) => {
      try {
        store.setLoading(true);
        store.clearError();
        
        const response = await authApi.signup(data);
        store.login(response.user, response.accessToken, response.refreshToken);
        
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Signup failed";
        store.setError(errorMessage);
        throw error;
      } finally {
        store.setLoading(false);
      }
    },
    
    logout: async () => {
      try {
        await authApi.logout();
      } finally {
        store.logout();
      }
    },
  };
};
