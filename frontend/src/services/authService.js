const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // Login con email y password
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      // Guardar token en localStorage
      this.token = data.token;
      localStorage.setItem('authToken', data.token);
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Verificar token actual
  async verifyToken() {
    try {
      if (!this.token) {
        throw new Error('No hay token disponible');
      }

      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.logout(); // Token inválido, logout automático
        }
        throw new Error(data.message || 'Token inválido');
      }

      return data;
    } catch (error) {
      console.error('Error verificando token:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      if (this.token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar datos locales independientemente del resultado
      this.token = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Obtener token actual
  getToken() {
    return this.token || localStorage.getItem('authToken');
  }

  // Verificar si está autenticado
  isAuthenticated() {
    return !!this.getToken();
  }

  // Obtener headers de autorización
  getAuthHeaders() {
    const token = this.getToken();
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  }
}

export default new AuthService();
