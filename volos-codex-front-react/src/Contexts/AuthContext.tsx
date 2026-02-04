import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  handleLoginSuccess: (credentialResponse: CredentialResponse) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('google_token'));
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const jwt = credentialResponse.credential;
      setToken(jwt);
      localStorage.setItem('google_token', jwt);
      
      // Decode JWT to get user info immediately
      try {
        const decoded: any = jwtDecode(jwt);
        setUser({
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture
        });
      } catch (e) {
        console.error("Failed to decode JWT", e);
      }
    }
  };

  const logout = () => {
    googleLogout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('google_token');
  };

  // Check for existing token on mount
  useEffect(() => {
    if (token && !user) {
      try {
        const decoded: any = jwtDecode(token);
        // Check expiration
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser({
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture
          });
        }
      } catch (e) {
        logout();
      }
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, handleLoginSuccess, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
