const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { COLLECTIONS } = require('../config/firebase');
const firestore = require('../utils/firestoreAdmin');

/**
 * Script para limpiar ventas falsas generadas por generateSales.js
 */
async function cleanFakeSales() {
  try {
    console.log('🧹 Iniciando limpieza de ventas falsas...');
    
    // Obtener todas las ventas
    console.log('📊 Obteniendo ventas existentes...');
    const salesSnapshot = await getDocs(collection(db, COLLECTIONS.SALES));
    
    if (salesSnapshot.empty) {
      console.log('✅ No hay ventas para limpiar.');
      return { success: true, deletedCount: 0 };
    }
    
    console.log(`⚠️ Se encontraron ${salesSnapshot.size} ventas en la base de datos`);
    
    // Confirmar antes de eliminar
    console.log('');
    console.log('🚨 ADVERTENCIA: Este script eliminará TODAS las ventas de la base de datos');
    console.log('   Esto incluye tanto ventas falsas como ventas reales');
    console.log('   Asegúrate de tener un respaldo de tus datos reales antes de continuar');
    console.log('');
    
    // En un entorno de producción, deberías pedir confirmación del usuario
    // Para este script, vamos a proceder con la limpieza
    
    let deletedCount = 0;
    const batchSize = 50; // Procesar en lotes para evitar sobrecarga
    
    console.log('🗑️ Eliminando ventas en lotes...');
    
    const salesDocs = salesSnapshot.docs;
    for (let i = 0; i < salesDocs.length; i += batchSize) {
      const batch = salesDocs.slice(i, i + batchSize);
      
      console.log(`Procesando lote ${Math.floor(i / batchSize) + 1}: eliminando ${batch.length} ventas...`);
      
      const deletePromises = batch.map(async (saleDoc) => {
        try {
          await deleteDoc(doc(db, COLLECTIONS.SALES, saleDoc.id));
          return true;
        } catch (error) {
          console.error(`Error eliminando venta ${saleDoc.id}:`, error);
          return false;
        }
      });
      
      const results = await Promise.all(deletePromises);
      const successfulDeletions = results.filter(result => result === true).length;
      deletedCount += successfulDeletions;
      
      console.log(`Lote completado: ${successfulDeletions}/${batch.length} ventas eliminadas`);
    }
    
    console.log('');
    console.log('✅ LIMPIEZA COMPLETADA:');
    console.log(`🗑️ Ventas eliminadas: ${deletedCount}`);
    console.log(`💾 Base de datos limpia y lista para datos reales`);
    
    // Verificar que la limpieza fue exitosa
    const verificationSnapshot = await getDocs(collection(db, COLLECTIONS.SALES));
    console.log(`🔍 Verificación: ${verificationSnapshot.size} ventas restantes en la base de datos`);
    
    if (verificationSnapshot.size === 0) {
      console.log('🎉 ¡Limpieza exitosa! La base de datos está completamente limpia.');
    } else {
      console.log('⚠️ Algunas ventas no fueron eliminadas. Revisa los logs de errores.');
    }
    
    return {
      success: true,
      deletedCount,
      remainingCount: verificationSnapshot.size
    };
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  }
}

/**
 * Script alternativo para identificar y eliminar solo ventas con patrones de datos falsos
 */
async function cleanOnlyFakeSales() {
  try {
    console.log('🔍 Identificando ventas falsas por patrones...');
    
    const salesSnapshot = await getDocs(collection(db, COLLECTIONS.SALES));
    
    if (salesSnapshot.empty) {
      console.log('✅ No hay ventas para analizar.');
      return { success: true, deletedCount: 0 };
    }
    
    const fakeSales = [];
    const realSales = [];
    
    salesSnapshot.forEach(doc => {
      const sale = doc.data();
      
      // Identificar ventas falsas por patrones:
      // 1. Cliente solo es "Cliente General"
      // 2. Fechas exactamente entre enero-junio 2025
      // 3. Productos múltiples aleatorios
      const isFake = (
        sale.clientName === 'Cliente General' &&
        sale.timestamp &&
        new Date(sale.timestamp.toDate ? sale.timestamp.toDate() : sale.timestamp).getFullYear() === 2025 &&
        new Date(sale.timestamp.toDate ? sale.timestamp.toDate() : sale.timestamp).getMonth() < 6
      );
      
      if (isFake) {
        fakeSales.push({ id: doc.id, ...sale });
      } else {
        realSales.push({ id: doc.id, ...sale });
      }
    });
    
    console.log(`📊 Análisis completado:`);
    console.log(`   Ventas identificadas como FALSAS: ${fakeSales.length}`);
    console.log(`   Ventas identificadas como REALES: ${realSales.length}`);
    
    if (fakeSales.length === 0) {
      console.log('✅ No se encontraron ventas falsas para eliminar.');
      return { success: true, deletedCount: 0 };
    }
    
    console.log('🗑️ Eliminando solo ventas falsas...');
    
    let deletedCount = 0;
    const batchSize = 50;
    
    for (let i = 0; i < fakeSales.length; i += batchSize) {
      const batch = fakeSales.slice(i, i + batchSize);
      
      console.log(`Eliminando lote ${Math.floor(i / batchSize) + 1}: ${batch.length} ventas falsas...`);
      
      const deletePromises = batch.map(async (sale) => {
        try {
          await deleteDoc(doc(db, COLLECTIONS.SALES, sale.id));
          return true;
        } catch (error) {
          console.error(`Error eliminando venta falsa ${sale.id}:`, error);
          return false;
        }
      });
      
      const results = await Promise.all(deletePromises);
      const successfulDeletions = results.filter(result => result === true).length;
      deletedCount += successfulDeletions;
    }
    
    console.log('');
    console.log('✅ LIMPIEZA SELECTIVA COMPLETADA:');
    console.log(`🗑️ Ventas falsas eliminadas: ${deletedCount}`);
    console.log(`💾 Ventas reales preservadas: ${realSales.length}`);
    
    return {
      success: true,
      deletedCount,
      preservedCount: realSales.length
    };
    
  } catch (error) {
    console.error('❌ Error durante la limpieza selectiva:', error);
    throw error;
  }
}

// Menú para elegir tipo de limpieza
async function main() {
  console.log('🧹 SCRIPT DE LIMPIEZA DE VENTAS FALSAS');
  console.log('=====================================');
  console.log('');
  console.log('Opciones disponibles:');
  console.log('1. Limpieza completa (elimina TODAS las ventas)');
  console.log('2. Limpieza selectiva (elimina solo ventas identificadas como falsas)');
  console.log('');
  
  // Por seguridad, usar limpieza selectiva por defecto
  const useSelectiveCleaning = true;
  
  if (useSelectiveCleaning) {
    console.log('🎯 Usando limpieza selectiva (recomendado)...');
    return await cleanOnlyFakeSales();
  } else {
    console.log('⚠️ Usando limpieza completa...');
    return await cleanFakeSales();
  }
}

// Ejecutar el script
if (require.main === module) {
  main()
    .then(result => {
      console.log('\n🎉 Script de limpieza completado:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { cleanFakeSales, cleanOnlyFakeSales };