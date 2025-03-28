import { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';

/**
 * Custom hook to manage product data and related state
 * @param {Function} setError - Function to set error messages
 * @returns {Object} Product data and related functions
 */
const useProductData = (setError) => {
  // Estados principales
  const [products, setProducts] = useState([]);
  const [wallet, setWallet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de demostración (usar si la API falla)
  const demoProducts = [
    { id: "prod1", nombre: "Coca Cola", label: "botella", precio: 25, categoria: "bebida" },
    { id: "prod2", nombre: "Snickers", label: "barrita", precio: 15, categoria: "botella" },
    { id: "prod3", nombre: "Chicle Trident", label: "chicle", precio: 10, categoria: "golosina" },
    { id: "prod4", nombre: "Agua Mineral", label: "botella", precio: 20, categoria: "bebida" },
    { id: "prod5", nombre: "Jabón Dove", label: "jabon", precio: 35, categoria: "limpieza" }
  ];

  const demoWallet = [
    { id: "prod1", nombre: "Coca Cola", cantidad: 10 },
    { id: "prod2", nombre: "Snickers", cantidad: 15 },
    { id: "prod3", nombre: "Chicle Trident", cantidad: 20 },
    { id: "prod4", nombre: "Agua Mineral", cantidad: 8 },
    { id: "prod5", nombre: "Jabón Dove", cantidad: 5 }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        console.log("Cargando datos de productos e inventario...");

        // Primero cargar el wallet/inventario
        let walletData = [];
        try {
          const walletResponse = await apiService.getWallet();
          walletData = walletResponse.wallet || [];
          console.log(`Wallet cargado: ${walletData.length} items`, walletData);

          if (!walletData || walletData.length === 0) {
            console.log("Wallet vacío, usando demo como respaldo");
            walletData = demoWallet;
          }

          setWallet(walletData);
        } catch (err) {
          console.error("Error cargando wallet:", err);
          setWallet(demoWallet);
          walletData = demoWallet;
        }

        // Luego cargar los productos
        try {
          const productsResponse = await apiService.getProducts();
          const productsData = productsResponse.products || [];
          console.log(`Productos cargados: ${productsData.length}`, productsData);

          // Combinar la información de productos con el inventario
          const combinedProducts = productsData.map(product => {
            // Buscar el producto en el wallet para obtener el stock
            const walletItem = walletData.find(item => item.id === product.id);
            return {
              ...product,
              stock: walletItem ? walletItem.cantidad : 0
            };
          });

          console.log("Productos combinados con inventario:", combinedProducts);
          setProducts(combinedProducts);
        } catch (err) {
          console.error("Error cargando productos:", err);

          // Si fallan los productos, usar wallet para mostrar lo que tenemos
          const productsFromWallet = walletData.map(item => ({
            id: item.id,
            nombre: item.nombre,
            precio: 0, // No tenemos esta información
            label: item.nombre.toLowerCase(),
            stock: item.cantidad
          }));

          setProducts(productsFromWallet.length > 0 ? productsFromWallet : demoProducts);
        }
      } catch (err) {
        console.error("Error general cargando datos:", err);
        if (setError) {
          setError("Error al cargar productos y/o inventario. Usando datos locales.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setError]);

  // Actualizar wallet con nuevos datos (función que puede ser llamada desde fuera)
  const updateWallet = (newWalletData) => {
    setWallet(newWalletData);
    
    // También actualizar el stock en los productos
    setProducts(prevProducts => prevProducts.map(product => {
      const walletItem = newWalletData.find(item => item.id === product.id);
      return {
        ...product,
        stock: walletItem ? walletItem.cantidad : 0
      };
    }));
  };

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
      const walletResponse = await apiService.getWallet();
      if (walletResponse && walletResponse.wallet) {
        updateWallet(walletResponse.wallet);
      }
    } catch (err) {
      console.error("Error recargando datos:", err);
      if (setError) {
        setError("Error al actualizar inventario");
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    wallet,
    loading,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    updateWallet,
    refreshData
  };
};

export default useProductData;