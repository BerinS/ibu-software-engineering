import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'scanova_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // loading stays true until we've checked localStorage — prevents a flash
  // of "not logged in" state on page refresh before the check completes.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only restore if the object has the minimum required shape.
        // This guards against stale/corrupt entries from earlier sessions.
        if (parsed?.token && parsed?.id && parsed?.full_name) {
          setUser(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // Corrupt JSON — clear it and start fresh
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  // Called after a successful login or register response.
  // userData = { id, full_name, email, role, token }
  // Guards against storing a malformed object if the API ever returns unexpected data.
  const login = (userData) => {
    if (!userData?.token || !userData?.id || !userData?.full_name) {
      console.error('AuthContext.login: received invalid user data', userData);
      return;
    }
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Convenience hook — throws if used outside AuthProvider
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
