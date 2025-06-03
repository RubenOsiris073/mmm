import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const useCart = ({ products, setError }) => {
  const [cartItems, setCartItems] = useState([]);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);

  // Validar stock disponible - CORREGIDO: usar products en lugar de wallet
  const getAvailableStock = useCallback((productId) => {
    if (!products || !Array.isArray(products)) return 0;
    
    const product = products.find(p => p && p.id === productId);
    return product ? (product.cantidad || product.stock || 0) : 0;
  }, [products]);

  // Añadir producto al carrito
  const addToCart = useCallback((product) => {
    if (!product || !product.id) {
      console.error("Producto no válido para añadir al carrito");
      return;
    }

    // Obtener stock directamente del producto para evitar discrepancias
    const availableStock = product.cantidad !== undefined ? product.cantidad : (product.stock || 0);
    
    console.log(`Añadiendo producto: ${product.nombre}, Stock disponible: ${availableStock}`);
    
    setCartItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Producto ya existe, incrementar cantidad
        const updatedItems = [...currentItems];
        const currentQuantity = updatedItems[existingItemIndex].quantity || 0;
        const newQuantity = currentQuantity + 1;
        
        // Verificar stock
        if (newQuantity > availableStock) {
          toast.error(`No hay suficiente stock para ${product.nombre}. Stock disponible: ${availableStock}`);
          return currentItems;
        }
        
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
          total: (updatedItems[existingItemIndex].precio || 0) * newQuantity
        };
        
        return updatedItems;
      } else {
        // Nuevo producto
        if (availableStock <= 0) {
          toast.error(`${product.nombre}: Sin stock disponible (Stock: ${availableStock})`);
          return currentItems;
        }
        
        const newItem = { 
          ...product, 
          quantity: 1, 
          total: product.precio || 0 
        };
        
        return [...currentItems, newItem];
      }
    });
    
    setLastAddedProduct(product);
    setTimeout(() => setLastAddedProduct(null), 2000);
  }, []);

  // Remover producto del carrito
  const removeFromCart = useCallback((id) => {
    setCartItems(currentItems => currentItems.filter(item => item.id !== id));
  }, []);

  // Actualizar cantidad
  const updateQuantity = useCallback((id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    const availableStock = getAvailableStock(id);
    
    if (newQuantity > availableStock) {
      const cartItem = cartItems.find(item => item.id === id);
      toast.error(`No hay suficiente stock para ${cartItem?.nombre || 'este producto'}. Stock disponible: ${availableStock}`);
      return;
    }

    setCartItems(currentItems =>
      currentItems.map(item =>
        item.id === id
          ? { 
              ...item, 
              quantity: newQuantity, 
              total: (item.precio || 0) * newQuantity
            }
          : item
      )
    );
  }, [getAvailableStock, removeFromCart, cartItems]);

  // Calcular total del carrito
  const calculateTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => {
      const precio = item.precio || 0;
      const quantity = item.quantity || 0;
      return sum + (precio * quantity);
    }, 0);
  }, [cartItems]);

  return {
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    lastAddedProduct,
    setLastAddedProduct,
  };
};

export default useCart;