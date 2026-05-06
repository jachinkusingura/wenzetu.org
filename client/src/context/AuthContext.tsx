import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types';
import { authService } from '../services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser  = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role?: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password, role });
      setUser(response.user as User);
      setToken(response.token);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(response.user));
    } catch (err) {
      setLoading(false);
      throw err;          // ← re-throw so LoginView shows the error
    }
    setLoading(false);
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, role?: string) => {
    setLoading(true);
    try {
      const response = await authService.register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
      });
      setUser(response.user as User);
      setToken(response.token);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(response.user));
    } catch (err) {
      setLoading(false);
      throw err;          // ← re-throw so RegisterView shows the error
    }
    setLoading(false);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
