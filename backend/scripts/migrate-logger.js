#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para migrar console.log a nuevo sistema de Logger
 */

const BACKEND_DIR = path.join(__dirname, '..');
const EXCLUDED_FILES = ['logger.js', 'migrate-logger.js', 'logsRoutes.js'];

function getAllJSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      getAllJSFiles(fullPath, files);
    } else if (item.endsWith('.js') && !EXCLUDED_FILES.includes(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function migrateFile(filePath) {
  console.log(`\nMigrando: ${path.relative(BACKEND_DIR, filePath)}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Verificar si ya tiene el import del Logger
  const hasLoggerImport = content.includes("require('../utils/logger')") || 
                         content.includes("require('./utils/logger')");
  
  // Contar console.log existentes
  const consoleLogMatches = content.match(/console\.(log|error|warn|info)/g) || [];
  
  if (consoleLogMatches.length === 0) {
    console.log('  ✓ No hay console.log para migrar');
    return;
  }
  
  console.log(`  📝 Encontrados ${consoleLogMatches.length} console.log`);
  
  // Agregar import del Logger si no existe
  if (!hasLoggerImport) {
    // Determinar la ruta relativa correcta
    const relativePath = path.relative(path.dirname(filePath), path.join(BACKEND_DIR, 'utils/logger.js'));
    const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
    
    // Buscar donde insertar el import
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Buscar después de los últimos requires
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('require(') && !lines[i].trim().startsWith('//')) {
        insertIndex = i + 1;
      }
      if (lines[i].trim() === '' && insertIndex > 0) {
        break;
      }
    }
    
    lines.splice(insertIndex, 0, `const Logger = require('${importPath}');`);
    content = lines.join('\n');
    hasChanges = true;
    console.log('  + Agregado import del Logger');
  }
  
  // Reemplazos de console.log
  const replacements = [
    {
      pattern: /console\.log\(/g,
      replacement: 'Logger.info(',
      description: 'console.log → Logger.info'
    },
    {
      pattern: /console\.error\(/g,
      replacement: 'Logger.error(',
      description: 'console.error → Logger.error'
    },
    {
      pattern: /console\.warn\(/g,
      replacement: 'Logger.warn(',
      description: 'console.warn → Logger.warn'
    },
    {
      pattern: /console\.info\(/g,
      replacement: 'Logger.info(',
      description: 'console.info → Logger.info'
    }
  ];
  
  for (const { pattern, replacement, description } of replacements) {
    const beforeCount = (content.match(pattern) || []).length;
    content = content.replace(pattern, replacement);
    const afterCount = (content.match(pattern) || []).length;
    
    if (beforeCount > afterCount) {
      console.log(`  ✓ ${description}: ${beforeCount - afterCount} reemplazos`);
      hasChanges = true;
    }
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  ✅ Archivo migrado exitosamente');
  } else {
    console.log('  ⚠️  No se realizaron cambios');
  }
}

function main() {
  console.log('🚀 Iniciando migración de console.log a Logger...\n');
  
  const jsFiles = getAllJSFiles(BACKEND_DIR);
  console.log(`📁 Encontrados ${jsFiles.length} archivos JavaScript`);
  
  let migratedCount = 0;
  
  for (const file of jsFiles) {
    try {
      migrateFile(file);
      migratedCount++;
    } catch (error) {
      console.error(`❌ Error migrando ${file}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Migración completada: ${migratedCount}/${jsFiles.length} archivos procesados`);
  console.log('\n📋 Próximos pasos:');
  console.log('1. Revisar los archivos migrados');
  console.log('2. Ajustar manualmente logs específicos si es necesario');
  console.log('3. Probar la aplicación');
  console.log('4. Commit de los cambios');
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, getAllJSFiles };
