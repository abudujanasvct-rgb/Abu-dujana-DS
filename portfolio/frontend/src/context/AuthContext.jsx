import { createContext, useContext, useEffect, useState } from 'react';
import { getToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(!!getToken());

  function login(token) {
    localStorage.setItem('admin_token', token);
    setIsAuthed(true);
  }

  function logout() {
    localStorage.removeItem('admin_token');
    setIsAuthed(false);
  }

  // if token expires, any 401 from api/client should call logout() —
  // wiring left simple here, expand in AdminDashboard if you want auto-redirect

  return (
    <AuthContext.Provider value={{ isAuthed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
