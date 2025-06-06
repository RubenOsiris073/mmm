import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import apiService from '../../../services/apiService';

const useProductData = (externalSetError = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // Función para manejar errores
  const handleError = useCallback((error) => {
    console.error('Error en useProductData:', error);
    const errorMessage = error.message || 'Error desconocido';
    setError(errorMessage);
    
    if (externalSetError) {
      externalSetError(errorMessage);
    } else {
      toast.error(errorMessage);
    }
  }, [externalSetError]);

  // Función para eliminar duplicados
  const removeDuplicateProducts = useCallback((products) => {
    if (!Array.isArray(products)) return [];
    
    const unique = products.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );
    
    console.log(`Productos originales: ${products.length}, únicos: ${unique.length}`);
    return unique;
  }, []);

  // Función para cargar productos
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Cargando productos desde Firebase...');
      
      const response = await apiService.getProducts();
      console.log('Respuesta recibida:', response);
      
      if (!response || !response.data) {
        throw new Error('No se recibieron datos válidos del servidor');
      }

      // **CORRECCIÓN**: El backend devuelve { data: [productos], success: true, count: 56 }
      // Necesitamos acceder a response.data.data para obtener el array de productos
      const productsData = Array.isArray(response.data.data) ? response.data.data : 
                          Array.isArray(response.data) ? response.data : [];
      
      console.log('Estructura del backend:', {
        hasData: !!response.data,
        hasDataArray: !!response.data.data,
        dataType: typeof response.data,
        dataDataType: typeof response.data.data,
        isArray: Array.isArray(response.data.data),
        count: response.data.count || 'no count'
      });
      
      console.log('Datos de productos extraídos:', productsData);
      console.log('Cantidad de productos:', productsData.length);

      if (productsData.length === 0) {
        console.log('No hay productos disponibles');
        setProducts([]);
        return;
      }

      // Formatear productos
      const formattedProducts = productsData.map(product => ({
        ...product,
        id: product.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: product.name || product.nombre || product.label || "Producto sin nombre",
        nombre: product.nombre || product.name || product.label || "Producto sin nombre",
        label: product.label || product.nombre || product.name || "",
        price: typeof product.price === 'string' ? parseFloat(product.price) : (product.price || product.precio || 0),
        precio: typeof product.precio === 'string' ? parseFloat(product.precio) : (product.precio || product.price || 0),
        stock: typeof product.stock === 'string' ? parseInt(product.stock, 10) : (product.stock || product.cantidad || 0),
        cantidad: typeof product.cantidad === 'string' ? parseInt(product.cantidad, 10) : (product.cantidad || product.stock || 0),
        category: product.category || product.categoria || 'general',
        categoria: product.categoria || product.category || 'general'
      }));

      // Normalización adicional de productos
      const normalizedProducts = formattedProducts.map(product => {
        const stockDisponible = product.cantidad !== undefined ? product.cantidad : (product.stock || 0);
        
        return {
          ...product,
          nombre: product.nombre || product.label || "Producto sin nombre",
          name: product.name || product.nombre || "Producto sin nombre",
          stock: stockDisponible,
          cantidad: stockDisponible,
          precio: typeof product.precio === 'number' ? product.precio : parseFloat(product.precio || 0),
          price: typeof product.price === 'number' ? product.price : parseFloat(product.price || 0),
        };
      });

      // **DIAGNÓSTICO**: Mostrar todos los productos antes del filtro
      console.log('=== DIAGNÓSTICO DE PRODUCTOS ===');
      normalizedProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.nombre} - Stock: ${product.cantidad}`);
      });

      // Solo mostrar productos que tengan stock disponible
      const productsWithStock = normalizedProducts.filter(product => {
        const stockDisponible = product.cantidad !== undefined ? product.cantidad : (product.stock || 0);
        const hasStock = stockDisponible > 0;
        
        if (!hasStock) {
          console.log(`Producto filtrado por falta de stock: ${product.nombre} (Stock: ${stockDisponible})`);
        }
        
        return hasStock;
      });

      console.log(`Productos originales: ${normalizedProducts.length}, con stock: ${productsWithStock.length}`);

      setProducts(removeDuplicateProducts(productsWithStock));
      console.log(`Productos disponibles en POS: ${productsWithStock.length}`, productsWithStock.slice(0, 3));

      // Mostrar notificación informativa sobre productos filtrados
      const productosSinStock = normalizedProducts.length - productsWithStock.length;
      if (productosSinStock > 0) {
        console.log(`${productosSinStock} producto(s) sin stock no se mostrarán en el POS`);
      }
      
      if (productsWithStock.length > 0) {
        console.log(`${productsWithStock.length} producto(s) disponibles en POS`);
      }

    } catch (err) {
      console.error("Error cargando productos:", err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError, removeDuplicateProducts]);

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Productos filtrados con useMemo - también verificar stock en tiempo real
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    const term = searchTerm.toLowerCase();
    const filtered = products.filter(product => {
      // Verificar que aún tenga stock disponible
      const stockDisponible = product.cantidad !== undefined ? product.cantidad : (product.stock || 0);
      if (stockDisponible <= 0) {
        return false;
      }
      
      // Aplicar filtro de búsqueda
      return (product.name && product.name.toLowerCase().includes(term)) ||
             (product.nombre && product.nombre.toLowerCase().includes(term)) ||
             (product.label && product.label.toLowerCase().includes(term)) ||
             (product.id && product.id.toLowerCase().includes(term));
    });
    
    return filtered;
  }, [products, searchTerm]);

  return {
    products,
    loading,
    filteredProducts,
    searchTerm,
    setSearchTerm,
    loadProducts,
    error
  };
};

export default useProductData;