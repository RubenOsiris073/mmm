import React, { createContext, useContext, useState, useCallback } from 'react';

const ProductVisibilityContext = createContext();

export const useProductVisibility = () => {
  const context = useContext(ProductVisibilityContext);
  if (!context) {
    throw new Error('useProductVisibility debe ser usado dentro de ProductVisibilityProvider');
  }
  return context;
};

export const ProductVisibilityProvider = ({ children }) => {
  const [showProductList, setShowProductList] = useState(true);

  const toggleProductList = useCallback(() => {
    console.log('toggleProductList called, current state:', showProductList);
    setShowProductList(prev => {
      console.log('Changing showProductList from', prev, 'to', !prev);
      return !prev;
    });
  }, [showProductList]);

  const value = {
    showProductList,
    toggleProductList
  };

  console.log('ProductVisibilityProvider rendering with value:', value);

  return (
    <ProductVisibilityContext.Provider value={value}>
      {children}
    </ProductVisibilityContext.Provider>
  );
};

export default ProductVisibilityContext;