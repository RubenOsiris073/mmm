const { db, COLLECTIONS } = require('../config/firebase');
const { collection, doc, addDoc, getDocs, query, serverTimestamp } = require('firebase/firestore');
const { queryDocuments, searchByField, getServerTimestamp } = require('../utils/firebaseUtils');
/**
 * Obtiene todos los productos
 */
async function getAllProducts() {
    try {
      // Utilizar la utilidad para simplificar la consulta
      return await queryDocuments(COLLECTIONS.PRODUCTS);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      throw error;
    }
  }
  
  /**
   * Busca productos por nombre o etiqueta
   */
  async function searchProducts(term) {
    try {
      if (!term) {
        return await getAllProducts();
      }
      
      // Buscar en múltiples campos
      const byName = await searchByField(COLLECTIONS.PRODUCTS, 'nombre', term);
      const byLabel = await searchByField(COLLECTIONS.PRODUCTS, 'label', term);
      
      // Combinar resultados y eliminar duplicados
      const combined = [...byName];
      byLabel.forEach(product => {
        if (!combined.find(p => p.id === product.id)) {
          combined.push(product);
        }
      });
      
      return combined;
    } catch (error) {
      console.error("Error buscando productos:", error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo producto
   */
  async function createProduct(productData) {
    try {
      const { nombre, precio, categoria, label } = productData;
      
      if (!nombre || !precio) {
        throw new Error("Nombre y precio son requeridos");
      }
      
      const newProduct = {
        nombre,
        precio: parseFloat(precio),
        categoria: categoria || "",
        label: label || nombre.toLowerCase(),
        createdAt: getServerTimestamp(), // Usar utilidad
        updatedAt: getServerTimestamp() // Usar utilidad
      };
      
      const productsRef = collection(db, COLLECTIONS.PRODUCTS);
      const docRef = await addDoc(productsRef, newProduct);
      
      return { 
        id: docRef.id,
        ...newProduct,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error al crear producto:", error);
      throw error;
    }
  }
  
  module.exports = {
    getAllProducts,
    createProduct,
    searchProducts // Función adicional usando utilidades
  };