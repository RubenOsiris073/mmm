import { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';

/**
 * Custom hook to manage product data and related state
 * @param {Function} setError - Function to set error messages
 * @returns {Object} Product data and related functions
 */
const useProductData = (setError) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("Cargando datos de productos...");

        // Cargar los productos desde la API
        const productsResponse = await apiService.getProducts();
        const productsData = productsResponse.products || [];
        console.log(`Productos cargados: ${productsData.length}`, productsData);

        setProducts(productsData);
      } catch (err) {
        console.error("Error cargando productos:", err);
        if (setError) {
          setError("Error al cargar productos.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setError]);

  // Filtrar productos por término de búsqueda
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (product.nombre && product.nombre.toLowerCase().includes(term)) ||
      (product.label && product.label.toLowerCase().includes(term)) ||
      (product.categoria && product.categoria.toLowerCase().includes(term))
    );
  });

  // Función para recargar los datos desde la API
  const refreshData = async () => {
    setLoading(true);
    try {
      const productsResponse = await apiService.getProducts();
      const productsData = productsResponse.products || [];
      setProducts(productsData);
    } catch (err) {
      console.error("Error recargando datos:", err);
      if (setError) {
        setError("Error al actualizar productos");
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    refreshData
  };
};

export default useProductData;