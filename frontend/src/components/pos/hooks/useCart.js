import { useState } from 'react';
import { toast } from 'react-toastify';

const useCart = ({ wallet, products }) => {
  const [cartItems, setCartItems] = useState([]);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);

  // Add to cart
  const addToCart = (product) => {
    console.log("Añadiendo al carrito:", product);
    
    // Check if product has stock
    if (!product.stock || product.stock <= 0) {
      console.log(`Error: Producto sin stock disponible: ${product.nombre}`);
      toast.error(`${product.nombre}: Sin stock disponible`);
      return;
    }
    
    // Check if already in cart
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // Check if it doesn't exceed available stock
      if (existingItem.quantity + 1 > product.stock) {
        toast.error(`${product.nombre}: Stock insuficiente (${product.stock} disponibles)`);
        return;
      }
      
      // Increase quantity
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { 
              ...item, 
              quantity: item.quantity + 1, 
              total: (item.precio || 0) * (item.quantity + 1) 
            } 
          : item
      ));
    } else {
      // Add new item
      setCartItems([...cartItems, {
        id: product.id,
        nombre: product.nombre,
        precio: product.precio || 0,
        quantity: 1,
        total: (product.precio || 0),
        stock: product.stock // Save available stock
      }]);
    }
    
    // Show visual feedback
    setLastAddedProduct(product);
    setTimeout(() => setLastAddedProduct(null), 2000);
    
    // Play confirmation sound (optional)
    try {
      const audio = new Audio('/assets/beep.mp3');
      audio.play().catch(e => console.log("No se pudo reproducir sonido"));
    } catch (e) {
      console.log("Error reproduciendo sonido");
    }
    
    toast.success(`${product.nombre} añadido al carrito`);
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Update quantity
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    // Check available stock
    const cartItem = cartItems.find(item => item.id === id);
    const walletItem = wallet.find(w => w.id === id);

    if (walletItem && newQuantity > walletItem.cantidad) {
      toast.error(`No hay suficiente stock para ${cartItem.nombre}`);
      return;
    }

    setCartItems(cartItems.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity, total: item.precio * newQuantity }
        : item
    ));
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  return {
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    lastAddedProduct,
  };
};

export default useCart;