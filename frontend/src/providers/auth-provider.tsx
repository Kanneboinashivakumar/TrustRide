import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  googleId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  profilePhoto?: string;
  role: string;
  organization: string;
  department?: string;
  phone?: string;
  employeeId?: string;
  designation?: string;
  provider?: 'google' | 'email';
  twoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  requires2FA: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (credential?: string) => Promise<{ success: boolean; error?: string }>;
  verify2FA: (code: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('trustride_user');
    if (savedUser) return JSON.parse(savedUser);
    return null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('trustride_token'));
  const [requires2FA, setRequires2FA] = useState<boolean>(false);

  // Restore Session on Application Startup (GET /api/auth/me)
  useEffect(() => {
    const fetchMe = async () => {
      const activeToken = token || localStorage.getItem('trustride_token');
      if (!activeToken) return;

      try {
        const res = await fetch(`/api/auth/me?token=${encodeURIComponent(activeToken)}`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('trustride_user', JSON.stringify(data.user));
          }
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      }
    };

    fetchMe();
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('trustride_user', JSON.stringify(user));
    if (token) localStorage.setItem('trustride_token', token);
  }, [user, token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      setToken(data.token);
      setRequires2FA(data.requires2FA || false);

      return { success: true, requires2FA: data.requires2FA };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed' };
    }
  };

  const googleLogin = async (credential?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!credential) {
        return { success: false, error: 'Google OAuth credential token missing' };
      }

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

      if (!res.ok) {
        return { success: false, error: data.error || `Server error (${res.status})` };
      }

      if (!data.token || !data.user) {
        return { success: false, error: 'Incomplete authentication payload received' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('trustride_token', data.token);
      localStorage.setItem('trustride_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      console.error('Google OAuth Login error:', err);
      return { success: false, error: err?.message || 'Network failure during Google authentication' };
    }
  };

  const verify2FA = async (code: string) => {
    if (code.length === 6) {
      setRequires2FA(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRequires2FA(false);
    localStorage.removeItem('trustride_user');
    localStorage.removeItem('trustride_token');
  };

  const updateProfile = async (updated: Partial<User>) => {
    if (!user) return;
    const newUserData = { ...user, ...updated };
    setUser(newUserData);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData),
      });
    } catch {
      // Fallback
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !requires2FA,
        requires2FA,
        login,
        register,
        googleLogin,
        verify2FA,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
