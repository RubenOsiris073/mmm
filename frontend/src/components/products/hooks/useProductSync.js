import { useState, useEffect, useCallback } from 'react';
import apiService from '../../../services/apiService';

/**
 * Hook personalizado para manejar la sincronización de productos y stock
 */
const useProductSync = (initialProducts = []) => {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para refrescar productos desde el backend
  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useProductSync] Refrescando productos desde backend...');
      const response = await apiService.getProducts();
      
      console.log('🔍 [useProductSync] Respuesta del backend:', response);
      
      // Extraer productos según la estructura de respuesta
      let freshProducts = [];
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        freshProducts = response.data.data;
        console.log(`[useProductSync] Productos obtenidos: ${freshProducts.length}`);
        setProducts(freshProducts);
      } else if (response?.data && Array.isArray(response.data)) {
        freshProducts = response.data;
        console.log(`[useProductSync] Productos obtenidos (formato directo): ${freshProducts.length}`);
        setProducts(freshProducts);
      } else {
        console.warn('⚠️ [useProductSync] Formato de respuesta inesperado:', response);
        return false;
      }
      
      // Actualizar estado
      setProducts(freshProducts);
      console.log('🎯 [useProductSync] Estado actualizado exitosamente');
      return true;
      
    } catch (err) {
      console.error('❌ [useProductSync] Error refrescando productos:', err);
      setError(err.message || 'Error al refrescar productos');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar un producto específico
  const updateProduct = useCallback((updatedProduct) => {
    console.log('📊 [useProductSync] Actualizando producto:', updatedProduct);
    
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === updatedProduct.id ? {
          ...product,
          ...updatedProduct,
          cantidad: updatedProduct.cantidad || updatedProduct.stock || product.cantidad,
          stock: updatedProduct.stock || updatedProduct.cantidad || product.stock
        } : product
      )
    );

    // Refrescar desde backend para asegurar sincronización
    setTimeout(() => {
      refreshProducts();
    }, 500);
  }, [refreshProducts]);

  // Función para eliminar un producto
  const removeProduct = useCallback((productId) => {
    console.log('🗑️ [useProductSync] Eliminando producto:', productId);
    
    setProducts(prevProducts => 
      prevProducts.filter(product => product.id !== productId)
    );
  }, []);

  // Listener para eventos de stock actualizado
  useEffect(() => {
    const handleStockUpdated = (event) => {
      console.log('📊 [useProductSync] Evento stock-updated recibido:', event.detail);
      refreshProducts();
    };

    window.addEventListener('stock-updated', handleStockUpdated);
    return () => window.removeEventListener('stock-updated', handleStockUpdated);
  }, [refreshProducts]);

  // Actualizar productos cuando cambien los props iniciales
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  return {
    products,
    loading,
    error,
    refreshProducts,
    updateProduct,
    removeProduct,
    setProducts
  };
};

export default useProductSync;