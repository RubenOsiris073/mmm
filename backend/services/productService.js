const { db, COLLECTIONS } = require('../config/firebase');
const { collection, doc, addDoc, getDocs, query, serverTimestamp } = require('firebase/firestore');
const { queryDocuments, searchByField, getServerTimestamp, getDocumentById } = require('../utils/firebaseUtils');
const inventoryService = require('./inventoryService');

/**
 * Obtiene todos los productos directamente desde Firebase
 * El stock se lee directamente del campo 'cantidad' o 'stock' del documento
 */
async function getAllProducts() {
    try {
      console.log("🔍 Obteniendo productos directamente desde Firebase...");
      
      // Obtener productos del catálogo con stock incluido
      const products = await queryDocuments(COLLECTIONS.PRODUCTS);
      
      if (products.length === 0) {
        console.log("No hay productos en el catálogo");
        return [];
      }
      
      // Los productos ya vienen con su stock desde Firebase
      // Solo asegurar que tengan campos de stock consistentes
      const productsWithStock = products.map(product => ({
        ...product,
        cantidad: product.cantidad || product.stock || 0,
        stock: product.stock || product.cantidad || 0
      }));
      
      console.log(`✅ Productos obtenidos: ${productsWithStock.length} (stock desde documento Firebase)`);
      
      // Mostrar resumen de stock
      const productsWithStock_count = productsWithStock.filter(p => (p.cantidad || 0) > 0).length;
      const productsWithoutStock_count = productsWithStock.filter(p => (p.cantidad || 0) === 0).length;
      
      console.log(`📊 Resumen: ${productsWithStock_count} con stock, ${productsWithoutStock_count} sin stock`);
      
      return productsWithStock;
    } catch (error) {
      console.error("❌ Error al obtener productos:", error);
      throw error;
    }
  }
  
  /**
   * Busca productos por nombre o etiqueta con stock sincronizado
   */
  async function searchProducts(term) {
    try {
      if (!term) {
        return await getAllProducts();
      }
      
      // Obtener todos los productos con stock para filtrar localmente
      const allProductsWithStock = await getAllProducts();
      
      // Filtrar por término de búsqueda
      const filteredProducts = allProductsWithStock.filter(product => 
        (product.nombre && product.nombre.toLowerCase().includes(term.toLowerCase())) ||
        (product.label && product.label.toLowerCase().includes(term.toLowerCase())) ||
        (product.codigo && product.codigo.toLowerCase().includes(term.toLowerCase()))
      );
      
      return filteredProducts;
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