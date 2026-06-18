import React, { createContext, useContext, useState } from 'react';
import * as authLib from '../lib/auth';
import { StoredUser } from '../lib/auth';

interface AuthContextType {
  currentUser: StoredUser | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(() => authLib.getCurrentUser());

  async function signup(email: string, password: string, displayName: string) {
    const user = authLib.signup(email, password, displayName);
    setCurrentUser(user);
  }

  async function login(email: string, password: string) {
    const user = authLib.login(email, password);
    setCurrentUser(user);
  }

  async function logout() {
    authLib.logout();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading: false, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
