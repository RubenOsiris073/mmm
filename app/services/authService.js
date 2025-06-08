import AsyncStorage from '@react-native-async-storage/async-storage';

// Usar tu IP WiFi directamente (red WiFi donde está tu teléfono)
const AUTH_SERVER_URL = 'http://154.0.0.5:5000/api';

// Servicio de autenticación HTTP (sin Firebase directamente)
export const authService = {
  // Login con email y password
  signInWithEmail: async (email, password) => {
    try {
      console.log('🔑 Enviando login al servidor...');
      
      const response = await fetch(`${AUTH_SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('@auth_token', data.token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));

      console.log('✅ Login exitoso:', data.user.email);
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      throw error;
    }
  },

  // Registro con email y password
  signUpWithEmail: async (email, password) => {
    try {
      console.log('📝 Enviando registro al servidor...');
      
      const response = await fetch(`${AUTH_SERVER_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('@auth_token', data.token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));

      console.log('✅ Registro exitoso:', data.user.email);
      return data;
    } catch (error) {
      console.error('❌ Error en registro:', error.message);
      throw error;
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${AUTH_SERVER_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token inválido, limpiar storage
        await authService.signOut();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('❌ Error verificando token:', error.message);
      await authService.signOut();
      return null;
    }
  },

  // Cerrar sesión
  signOut: async () => {
    try {
      console.log('👋 Cerrando sesión...');
      
      // Limpiar AsyncStorage
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user_data');

      console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  },

  // Obtener usuario actual desde AsyncStorage
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error);
      return null;
    }
  },

  // Obtener token actual
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      return null;
    }
  },

  // Verificar si está autenticado
  isAuthenticated: async () => {
    const token = await authService.getToken();
    if (!token) return false;

    const user = await authService.verifyToken();
    return !!user;
  }
};

export default authService;