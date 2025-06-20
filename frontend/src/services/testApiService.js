// API Service para testing de productos
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class TestApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/test/products`;
  }

  // Obtener token de autenticación
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // GET /api/test/products - Obtener todos los productos
  async getAllProducts() {
    try {
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Test API - Productos obtenidos:', data);
      return data;
    } catch (error) {
      console.error('Error en getAllProducts (test):', error);
      throw error;
    }
  }

  // GET /api/test/products/:id - Obtener producto específico
  async getProductById(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Test API - Producto obtenido:', data);
      return data;
    } catch (error) {
      console.error('Error en getProductById (test):', error);
      throw error;
    }
  }

  // POST /api/test/products - Crear producto
  async createProduct(productData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Test API - Producto creado:', data);
      return data;
    } catch (error) {
      console.error('Error en createProduct (test):', error);
      throw error;
    }
  }

  // PUT /api/test/products/:id - Actualizar producto
  async updateProduct(id, productData) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Test API - Producto actualizado:', data);
      return data;
    } catch (error) {
      console.error('Error en updateProduct (test):', error);
      throw error;
    }
  }

  // DELETE /api/test/products/:id - Eliminar producto
  async deleteProduct(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Test API - Producto eliminado:', data);
      return data;
    } catch (error) {
      console.error('Error en deleteProduct (test):', error);
      throw error;
    }
  }

  // Método para buscar productos
  async searchProducts(query) {
    try {
      const products = await this.getAllProducts();
      
      if (!products.success) {
        throw new Error(products.error);
      }

      const filtered = products.data.filter(product => 
        product.nombre?.toLowerCase().includes(query.toLowerCase()) ||
        product.codigo?.toLowerCase().includes(query.toLowerCase()) ||
        product.categoria?.toLowerCase().includes(query.toLowerCase())
      );

      return {
        success: true,
        data: filtered,
        count: filtered.length,
        testing: true
      };
    } catch (error) {
      console.error('Error en searchProducts (test):', error);
      throw error;
    }
  }

  // Método para filtrar por categoría
  async getProductsByCategory(category) {
    try {
      const products = await this.getAllProducts();
      
      if (!products.success) {
        throw new Error(products.error);
      }

      const filtered = products.data.filter(product => 
        category === 'all' || product.categoria === category
      );

      return {
        success: true,
        data: filtered,
        count: filtered.length,
        testing: true
      };
    } catch (error) {
      console.error('Error en getProductsByCategory (test):', error);
      throw error;
    }
  }
}

// Crear instancia única del servicio
export const testApiService = new TestApiService();

// Export por defecto
export default testApiService;