// AuthContext.jsx - Contexto global de autenticación
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, setToken, removeToken, getProfile } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario si hay token al iniciar la app
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getProfile(token);
        setUser(userData);
      } catch (err) {
        console.error('Error al cargar usuario:', err);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Función para iniciar sesión
  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
  };

  // Función para cerrar sesión
  const logout = () => {
    removeToken();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};