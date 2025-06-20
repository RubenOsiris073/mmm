import { useState, useEffect } from 'react';

/**
 * Hook para sincronización de productos en entorno de testing
 * Maneja el estado local de productos y sincronización con la API de testing
 */
const useProductSyncTest = (initialProducts = []) => {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

  // Sincronizar con props cuando cambien
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Función para actualizar un producto
  const updateProduct = (updatedProduct) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === updatedProduct.id ? { ...product, ...updatedProduct } : product
      )
    );
  };

  // Función para remover un producto
  const removeProduct = (productId) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product.id !== productId)
    );
  };

  // Función para agregar un producto
  const addProduct = (newProduct) => {
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  return {
    products,
    loading,
    updateProduct,
    removeProduct,
    addProduct,
    setProducts
  };
};

export default useProductSyncTest;