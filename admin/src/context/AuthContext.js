import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    const isStore = router.pathname.startsWith('/store');
    if (isStore) { setLoading(false); return; }

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      if (router.pathname !== '/login') {
        router.push('/login');
      }
      return;
    }

    try {
      const data = await authApi.me();
      setUser(data.user);
      if (router.pathname === '/login') {
        router.push('/');
      }
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      if (router.pathname !== '/login') {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      router.push('/');
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
