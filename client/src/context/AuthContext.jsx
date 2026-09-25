import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore authentication state from localStorage on startup
    const storedToken = localStorage.getItem('medicart_token');
    const storedUser = localStorage.getItem('medicart_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (err) {
        console.error('Failed to parse stored auth user:', err);
        localStorage.removeItem('medicart_token');
        localStorage.removeItem('medicart_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenString) => {
    localStorage.setItem('medicart_token', tokenString);
    localStorage.setItem('medicart_user', JSON.stringify(userData));
    setUser(userData);
    setToken(tokenString);
  };

  const logout = () => {
    localStorage.removeItem('medicart_token');
    localStorage.removeItem('medicart_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
