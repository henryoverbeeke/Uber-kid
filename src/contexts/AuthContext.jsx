import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth) : { role: null };
  });
  
  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  const login = (role) => {
    setIsAuthenticated({ role });
  };

  const logout = () => {
    setIsAuthenticated({ role: null });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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