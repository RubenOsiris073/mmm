import { useState, useEffect, useMemo } from 'react';
import apiService from '../../../services/apiService';

const usePOSProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // Load products using apiService
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProducts();
      const productsData = response.data?.data || response.data || [];
      setProducts(productsData);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter products with stock and search term
  const filteredProducts = useMemo(() => {
    const productsWithStock = products.filter(product => {
      const stock = product.cantidad || product.stock || 0;
      return stock > 0;
    });

    if (!searchTerm) return productsWithStock;

    const term = searchTerm.toLowerCase();
    return productsWithStock.filter(product =>
      (product.nombre && product.nombre.toLowerCase().includes(term)) ||
      (product.name && product.name.toLowerCase().includes(term)) ||
      (product.codigo && product.codigo.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    filteredProducts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    loadProducts,
    setError
  };
};

export default usePOSProducts;