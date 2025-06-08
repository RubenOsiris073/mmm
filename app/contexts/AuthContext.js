import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { Alert } from 'react-native';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticación HTTP...');
        
        // Verificar si hay una sesión guardada
        const savedUser = await authService.getCurrentUser();
        
        if (savedUser) {
          console.log('👤 Usuario encontrado en storage:', savedUser.email);
          
          // Verificar que el token sigue siendo válido
          const verifiedUser = await authService.verifyToken();
          
          if (verifiedUser) {
            setUser(verifiedUser);
            console.log('✅ Sesión válida restaurada');
          } else {
            console.log('❌ Token expirado, limpiando sesión');
            await authService.signOut();
          }
        } else {
          console.log('👥 No hay sesión guardada');
        }
        
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error al inicializar autenticación:', error);
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await authService.signInWithEmail(email, password);
      setUser(result.user);
      return result;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    try {
      setLoading(true);
      const result = await authService.signUpWithEmail(email, password);
      setUser(result.user);
      return result;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      console.log('👋 Usuario desconectado');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    initialized,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};