import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const useCart = ({ wallet, products }) => {
  const [cartItems, setCartItems] = useState([]);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);

  // Implementación mejorada para addToCart
  const addToCart = useCallback((product) => {
    // Validar entrada
    if (!product || !product.id) {
      console.error("Producto no válido para añadir al carrito");
      return;
    }

    console.log("Añadiendo al carrito:", product);

    setCartItems(currentItems => {
      // Buscar si el producto ya está en el carrito
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // El producto ya está en el carrito, actualizar cantidad
        const updatedItems = [...currentItems];
        const newQuantity = (updatedItems[existingItemIndex].quantity || 0) + 1;
        
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
          total: (updatedItems[existingItemIndex].precio || 0) * newQuantity
        };
        
        return updatedItems;
      } else {
        // El producto no está en el carrito, agregar como nuevo item
        // Asegurarnos de que tiene los campos necesarios
        const newItem = { 
          ...product, 
          quantity: 1, 
          total: product.precio || 0 
        };
        
        return [...currentItems, newItem];
      }
    });
    
    // NO mostrar toast aquí para evitar duplicación
    
  }, []);

  // Remove from cart
  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Update quantity corregido
  const updateQuantity = useCallback((id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    // Check available stock - Con verificaciones de seguridad
    const cartItem = cartItems.find(item => item.id === id);
    if (!cartItem) {
      console.error(`No se encontró el item con id ${id} en el carrito`);
      return;
    }
    
    // Verificar si wallet existe y es un array antes de usarlo
    if (wallet && Array.isArray(wallet)) {
      const walletItem = wallet.find(w => w && w.id === id);

      if (walletItem && newQuantity > (walletItem.cantidad || walletItem.stock || 0)) {
        toast.error(`No hay suficiente stock para ${cartItem.nombre}`);
        return;
      }
    }

    setCartItems(cartItems.map(item =>
      item.id === id
        ? { 
            ...item, 
            quantity: newQuantity, 
            total: item.precio * newQuantity // Calcular total
          }
        : item
    ));
  }, [cartItems, removeFromCart, wallet]);

  // Calculate total mejorado
  const calculateTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => {
      // Verificar que precio y quantity existen
      const precio = item.precio || 0;
      const quantity = item.quantity || 0;
      const itemTotal = precio * quantity;
      
      console.log(`Item ${item.nombre}: $${precio} x ${quantity} = $${itemTotal}`);
      return sum + itemTotal;
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
    setLastAddedProduct, // Exportar esto también
  };
};

export default useCart;