import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ SIMPLE AUTH CHECK (NO API CALL = NO CRASH)
  const checkAuth = useCallback(() => {
    const isStore = router.pathname.startsWith('/store');

    if (isStore) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);

      if (router.pathname !== '/login') {
        router.push('/login');
      }
    }

    setLoading(false);
  }, [router]);

  // run once on load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ✅ LOGIN FUNCTION
  const login = async (email, password) => {
    const res = await fetch('https://apkorbit.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!data.success && !data.token) {
      throw new Error(data.message || 'Login failed');
    }

    // ✅ SAVE DATA (IMPORTANT FIX)
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    setUser(data.user);

    router.push('/');
    return data;
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
