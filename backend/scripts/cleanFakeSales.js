const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Logger = require('../utils/logger.js');

const { COLLECTIONS } = require('../config/firebaseManager');
const firestore = require('../utils/firestoreAdmin');

/**
 * Script para limpiar ventas falsas generadas por generateSales.js
 */
async function cleanFakeSales() {
  try {
    Logger.info('🧹 Iniciando limpieza de ventas falsas...');
    
    // Obtener todas las ventas
    Logger.info('📊 Obteniendo ventas existentes...');
    const salesSnapshot = await firestore.collection(COLLECTIONS.SALES).get();
    
    if (salesSnapshot.empty) {
      Logger.info('✅ No hay ventas para limpiar.');
      return { success: true, deletedCount: 0 };
    }
    
    Logger.info(`⚠️ Se encontraron ${salesSnapshot.size} ventas en la base de datos`);
    
    // Confirmar antes de eliminar
    Logger.info('');
    Logger.info('🚨 ADVERTENCIA: Este script eliminará TODAS las ventas de la base de datos');
    Logger.info('   Esto incluye tanto ventas falsas como ventas reales');
    Logger.info('   Asegúrate de tener un respaldo de tus datos reales antes de continuar');
    Logger.info('');
    
    // En un entorno de producción, deberías pedir confirmación del usuario
    // Para este script, vamos a proceder con la limpieza
    
    let deletedCount = 0;
    const batchSize = 50; // Procesar en lotes para evitar sobrecarga
    
    Logger.info('🗑️ Eliminando ventas en lotes...');
    
    const salesDocs = salesSnapshot.docs;
    for (let i = 0; i < salesDocs.length; i += batchSize) {
      const batch = salesDocs.slice(i, i + batchSize);
      
      Logger.info(`Procesando lote ${Math.floor(i / batchSize) + 1}: eliminando ${batch.length} ventas...`);
      
      const deletePromises = batch.map(async (saleDoc) => {
        try {
          await saleDoc.ref.delete();
          return true;
        } catch (error) {
          Logger.error(`Error eliminando venta ${saleDoc.id}:`, error);
          return false;
        }
      });
      
      const results = await Promise.all(deletePromises);
      const successfulDeletions = results.filter(result => result === true).length;
      deletedCount += successfulDeletions;
      
      Logger.info(`Lote completado: ${successfulDeletions}/${batch.length} ventas eliminadas`);
    }
    
    Logger.info('');
    Logger.info('✅ LIMPIEZA COMPLETADA:');
    Logger.info(`🗑️ Ventas eliminadas: ${deletedCount}`);
    Logger.info(`💾 Base de datos limpia y lista para datos reales`);
    
    // Verificar que la limpieza fue exitosa
    const verificationSnapshot = await firestore.collection(COLLECTIONS.SALES).get();
    Logger.info(`🔍 Verificación: ${verificationSnapshot.size} ventas restantes en la base de datos`);
    
    if (verificationSnapshot.size === 0) {
      Logger.info('🎉 ¡Limpieza exitosa! La base de datos está completamente limpia.');
    } else {
      Logger.info('⚠️ Algunas ventas no fueron eliminadas. Revisa los logs de errores.');
    }
    
    return {
      success: true,
      deletedCount,
      remainingCount: verificationSnapshot.size
    };
    
  } catch (error) {
    Logger.error('❌ Error durante la limpieza:', error);
    throw error;
  }
}

/**
 * Script alternativo para identificar y eliminar solo ventas con patrones de datos falsos
 */
async function cleanOnlyFakeSales() {
  try {
    Logger.info('🔍 Identificando ventas falsas por patrones...');
    
    const salesSnapshot = await firestore.collection(COLLECTIONS.SALES).get();
    
    if (salesSnapshot.empty) {
      Logger.info('✅ No hay ventas para analizar.');
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
    
    Logger.info(`📊 Análisis completado:`);
    Logger.info(`   Ventas identificadas como FALSAS: ${fakeSales.length}`);
    Logger.info(`   Ventas identificadas como REALES: ${realSales.length}`);
    
    if (fakeSales.length === 0) {
      Logger.info('✅ No se encontraron ventas falsas para eliminar.');
      return { success: true, deletedCount: 0 };
    }
    
    Logger.info('🗑️ Eliminando solo ventas falsas...');
    
    let deletedCount = 0;
    const batchSize = 50;
    
    for (let i = 0; i < fakeSales.length; i += batchSize) {
      const batch = fakeSales.slice(i, i + batchSize);
      
      Logger.info(`Eliminando lote ${Math.floor(i / batchSize) + 1}: ${batch.length} ventas falsas...`);
      
      const deletePromises = batch.map(async (sale) => {
        try {
          await firestore.collection(COLLECTIONS.SALES).doc(sale.id).delete();
          return true;
        } catch (error) {
          Logger.error(`Error eliminando venta falsa ${sale.id}:`, error);
          return false;
        }
      });
      
      const results = await Promise.all(deletePromises);
      const successfulDeletions = results.filter(result => result === true).length;
      deletedCount += successfulDeletions;
    }
    
    Logger.info('');
    Logger.info('✅ LIMPIEZA SELECTIVA COMPLETADA:');
    Logger.info(`🗑️ Ventas falsas eliminadas: ${deletedCount}`);
    Logger.info(`💾 Ventas reales preservadas: ${realSales.length}`);
    
    return {
      success: true,
      deletedCount,
      preservedCount: realSales.length
    };
    
  } catch (error) {
    Logger.error('❌ Error durante la limpieza selectiva:', error);
    throw error;
  }
}

// Menú para elegir tipo de limpieza
async function main() {
  Logger.info('🧹 SCRIPT DE LIMPIEZA DE VENTAS FALSAS');
  Logger.info('=====================================');
  Logger.info('');
  Logger.info('Opciones disponibles:');
  Logger.info('1. Limpieza completa (elimina TODAS las ventas)');
  Logger.info('2. Limpieza selectiva (elimina solo ventas identificadas como falsas)');
  Logger.info('');
  
  // Por seguridad, usar limpieza selectiva por defecto
  const useSelectiveCleaning = true;
  
  if (useSelectiveCleaning) {
    Logger.info('🎯 Usando limpieza selectiva (recomendado)...');
    return await cleanOnlyFakeSales();
  } else {
    Logger.info('⚠️ Usando limpieza completa...');
    return await cleanFakeSales();
  }
}

// Ejecutar el script
if (require.main === module) {
  main()
    .then(result => {
      Logger.info('\n🎉 Script de limpieza completado:', result);
      process.exit(0);
    })
    .catch(error => {
      Logger.error('\n❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { cleanFakeSales, cleanOnlyFakeSales };