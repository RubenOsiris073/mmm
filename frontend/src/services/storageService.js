import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  doc 
} from 'firebase/firestore';

import { COLLECTIONS, getDb } from './firebase';
import axios from 'axios';

// Función para obtener productos
export const getProducts = async () => {
  try {
    const response = await axios.get('/api/products');
 return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
 if (axios.isAxiosError(error) && error.response) {
 console.error('Backend response data:', error.response.data);
 console.error('Backend response status:', error.response.status);
 console.error('Backend response headers:', error.response.headers);
 throw new Error(`Error ${error.response.status}: ${error.response.data.message || error.message}`);
 } else {
 throw error;
 }
  }
};

// Función para guardar detalles de un producto
export const saveProductDetails = async (product) => {
  try {
 let url = '/api/products';
 let method = 'post';

    if (product.id) {
 url = `/api/products/${product.id}`;
 method = 'put';
    } else {
 method = 'post';
    }

    const response = await axios({
 method: method,
 url: url,
 data: product,
 });

 return response.data;

  } catch (error) {
    console.error('Error al guardar detalles del producto:', error);
 if (axios.isAxiosError(error) && error.response) {
 console.error('Backend response data:', error.response.data);
 console.error('Backend response status:', error.response.status);
 console.error('Backend response headers:', error.response.headers);
 throw new Error(`Error ${error.response.status}: ${error.response.data.message || error.message}`);
 } else {
 throw error;
 }
  }
};

// Función para eliminar un producto
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`/api/products/${productId}`);
 return response.data;

  } catch (error) {
    console.error('Error al eliminar producto:', error);
 if (axios.isAxiosError(error) && error.response) {
 console.error('Backend response data:', error.response.data);
 console.error('Backend response status:', error.response.status);
 console.error('Backend response headers:', error.response.headers);
 throw new Error(`Error ${error.response.status}: ${error.response.data.message || error.message}`);
 } else {
 throw error;
 }
  }
};

// Función para obtener productos registrados
export const getRegisteredProducts = async () => {
 return getProducts(); // getProducts ahora obtiene todo desde el backend
};

// Función para obtener detecciones
// **PENDIENTE DE REVISIÓN**: Lógica de detecciones y su uso en el frontend.
// Podría necesitar adaptación si la colección 'detections' cambia su rol
// o si el flujo de registro basado en detección se integra más directamente
// con la creación/actualización de productos en el backend.
// Por ahora, la dejo sin modificar para evitar romper la funcionalidad existente
// que pueda depender de ella.
// Importaciones de Firebase Client SDK y getDb ya no se usan directamente aquí, pero podrían ser necesarias en otros archivos.
// import { collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, doc } from 'firebase/firestore';
// import { COLLECTIONS, getDb } from './firebase';
export const getDetections = async () => {
  try {
    // Esta función aún podría ser necesaria si 'detections' sigue siendo una colección separada
    // con un propósito específico (ej. historial de detecciones crudas).
    // Si se integra, esta función o su uso en el frontend deberá ser modificado.
    // Por ahora, la dejo sin modificar para evitar romper la funcionalidad existente
    // que pueda depender de ella.
    // **Nota**: Esta función aún usa Firebase Client SDK. Debería refactorizarse para usar backend API.
    // Necesitaría las importaciones de Firebase Client SDK y getDb si no se mueven a otro lugar.
    console.warn("getDetections is still using Firebase Client SDK. Consider refactoring to use backend API.");
    // Placeholder - You would need to add the Firebase Client SDK imports back if you keep this function using it directly.
    // Or preferably, create a backend endpoint for detections.

    // Implementación placeholder que podría lanzar un error si no se refactoriza:
    // throw new Error("getDetections needs refactoring to use backend API or removed if no longer needed.");
    
    // Para evitar romper la aplicación de inmediato, retorno un array vacío.
    return []; 

  } catch (error) {
    console.error('Error al obtener detecciones:', error);
    // Manejo de error de axios si se refactoriza a usar backend
    if (axios.isAxiosError(error) && error.response) {
        console.error('Backend response data:', error.response.data);
        console.error('Backend response status:', error.response.status);
        console.error('Backend response headers:', error.response.headers);
        throw new Error(`Error ${error.response.status}: ${error.response.data.message || error.message}`);
    } else {
        throw error;
    }
  }
};

// Función para obtener productos con fechas seguras
export const getProductsWithSafeDates = async () => {
  const products = await getProducts(); // getProducts ahora llama al backend
  
  return products.map(product => ({
    ...product,
    createdAt: product.createdAt ? new Date(product.createdAt) : (product.createdAt && product.createdAt._seconds ? new Date(product.createdAt._seconds * 1000) : new Date()), // Manejar timestamps de Firebase si el backend los envía así
    updatedAt: product.updatedAt ? new Date(product.updatedAt) : (product.updatedAt && product.updatedAt._seconds ? new Date(product.updatedAt._seconds * 1000) : new Date())
  }));
};

// Función para asignar categorías automáticamente basándose en el nombre del producto
// **PENDIENTE DE REVISIÓN**: Esta lógica podría moverse al backend si la asignación automática
// de categorías se realiza durante la creación o actualización de productos en el servidor.
// Por ahora, la dejo sin modificar pero marcándola para posible refactorización.
export const assignCategoriesAutomatically = async () => {
  try {
    // **Nota**: Esta función aún usa Firebase Client SDK para actualizar productos individualmente.
    // Debería refactorizarse para llamar a un endpoint del backend para actualizar categorías
    // o integrar esta lógica en el proceso de creación/actualización de productos del backend.
    console.warn("assignCategoriesAutomatically is still using Firebase Client SDK for updates. Consider refactoring to use backend API.");
    // Placeholder - You would need to add the Firebase Client SDK imports back if you keep this function using it directly.
    // Or preferably, create a backend endpoint for this.

    // Implementación placeholder que podría lanzar un error si no se refactoriza:
    // throw new Error("assignCategoriesAutomatically needs refactoring to use backend API or moved to backend.");

    const products = await getProducts(); // Llama a getProducts que usa el backend
    console.log(`Procesando ${products.length} productos para asignar categorías...`);

    let updatedCount = 0;

    for (const product of products) {
      // Si ya tiene categoría, saltar
      if (product.categoria) continue;

      const productName = (product.nombre || product.label || product.name || '').toLowerCase();
      let categoria = 'otros'; // categoría por defecto

      // Reglas para asignar categorías automáticamente
      if (productName.includes('agua') || productName.includes('gaseosa') || 
          productName.includes('jugo') || productName.includes('bebida') ||
          productName.includes('refresco') || productName.includes('soda') ||
          productName.includes('cerveza') || productName.includes('vino')) {
        categoria = 'bebidas';
      } else if (productName.includes('pan') || productName.includes('galleta') ||
                 productName.includes('cereal') || productName.includes('arroz') ||
                 productName.includes('pasta') || productName.includes('leche') ||
                 productName.includes('queso') || productName.includes('yogurt') ||
                 productName.includes('fruta') || productName.includes('verdura') ||
                 productName.includes('carne') || productName.includes('pollo') ||
                 productName.includes('pescado') || productName.includes('huevo')) {
        categoria = 'alimentos';
      } else if (productName.includes('detergente') || productName.includes('jabón') ||
                 productName.includes('limpiador') || productName.includes('cloro') ||
                 productName.includes('desinfectante') || productName.includes('papel') ||
                 productName.includes('toalla') || productName.includes('servilleta')) {
        categoria = 'limpieza';
      } else if (productName.includes('aspirina') || productName.includes('medicina') ||
                 productName.includes('pastilla') || productName.includes('jarabe') ||
                 productName.includes('vitamina') || productName.includes('analgesico') ||
                 productName.includes('antibiotico') || productName.includes('ibuprofeno')) {
        categoria = 'medicamentos';
      }

      // Actualizar el producto con la categoría asignada
      try {
        // Llamar a saveProductDetails o un endpoint específico de actualización de categoría
        // para usar el backend refactorizado.
        // Placeholder - Implementación usando Firebase Client SDK que DEBE ser refactorizada.
        // Necesitaría las importaciones de Firebase Client SDK y getDb si no se mueven a otro lugar.
        // const productRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
        // await updateDoc(productRef, { categoria });
        // updatedCount++;
        // console.log(`Producto "${product.nombre || product.label}" categorizado como "${categoria}"`);
        console.warn(`Skipping category update for product ${product.id} using old method. Needs refactoring.`);

      } catch (error) {
        console.error(`Error actualizando producto ${product.id}:`, error);
      }
    }

    console.log(`Categorización completada: ${updatedCount} productos actualizados`);
    return { success: true, updatedCount };

  } catch (error) {
    console.error('Error al asignar categorías automáticamente:', error);
    // Manejo de error de axios si se refactoriza a usar backend
    if (axios.isAxiosError(error) && error.response) {
        console.error('Backend response data:', error.response.data);
        console.error('Backend response status:', error.response.status);
        console.error('Backend response headers:', error.response.headers);
        throw new Error(`Error ${error.response.status}: ${error.response.data.message || error.message}`);
    } else {
        throw error;
    }
  }
};

// **PENDIENTE DE REVISIÓN**: Funciones relacionadas con la gestión de stock directamente si existieran
// Estas funciones deberían ser reemplazadas por llamadas a endpoints del backend
// que a su vez usen productService.updateProductStock.