const path = require('path');

/**
 * Clase para logging mejorado con información de contexto y formato
 */
class Logger {
  static colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
  };

  static levels = {
    error: { color: 'red', prefix: 'ERROR' },
    warn: { color: 'yellow', prefix: 'WARN' },
    info: { color: 'blue', prefix: 'INFO' },
    success: { color: 'green', prefix: 'SUCCESS' },
    debug: { color: 'magenta', prefix: 'DEBUG' },
    system: { color: 'cyan', prefix: 'SYSTEM' }
  };

  /**
   * Obtener información del archivo que está llamando al log
   */
  static getCallerInfo() {
    const stack = new Error().stack;
    const stackLines = stack.split('\n');
    
    // Buscar la línea que no sea de este archivo
    for (let i = 3; i < stackLines.length; i++) {
      const line = stackLines[i];
      if (line.includes('at ') && !line.includes('logger.js')) {
        const match = line.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);
        if (match) {
          const [, functionName, filePath, lineNumber] = match;
          const fileName = path.basename(filePath);
          const relativePath = filePath.includes('/backend/') 
            ? filePath.split('/backend/')[1] 
            : fileName;
          
          return {
            file: fileName,
            path: relativePath,
            line: lineNumber,
            function: functionName
          };
        }
      }
    }
    
    return { file: 'unknown', path: 'unknown', line: '0', function: 'unknown' };
  }

  /**
   * Formatear timestamp
   */
  static getTimestamp() {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.toTimeString().slice(0, 8);
    return `${month}/${day} ${time}`;
  }

  /**
   * Crear mensaje formateado
   */
  static formatMessage(level, message, data = null) {
    const { colors } = Logger;
    const levelConfig = Logger.levels[level] || Logger.levels.info;
    const caller = Logger.getCallerInfo();
    const timestamp = Logger.getTimestamp();

    // Componentes del mensaje
    const timestampStr = `${colors.gray}[${timestamp}]${colors.reset}`;
    const levelStr = `${colors[levelConfig.color]}${colors.bright}[${levelConfig.prefix}]${colors.reset}`;
    const locationStr = `${colors.dim}${caller.path}:${caller.line}${colors.reset}`;
    
    let messageStr = `${timestampStr} ${levelStr} ${colors.cyan}${caller.file}${colors.reset}`;
    
    messageStr += ` - ${message}`;

    // Agregar datos adicionales si existen
    if (data !== null && data !== undefined) {
      if (typeof data === 'object') {
        messageStr += `\n${colors.gray}${JSON.stringify(data, null, 2)}${colors.reset}`;
      } else {
        messageStr += ` ${colors.gray}${data}${colors.reset}`;
      }
    }

    return messageStr;
  }

  /**
   * Log de error
   */
  static error(message, data = null) {
    console.error(Logger.formatMessage('error', message, data));
  }

  /**
   * Log de advertencia
   */
  static warn(message, data = null) {
    console.warn(Logger.formatMessage('warn', message, data));
  }

  /**
   * Log de información
   */
  static info(message, data = null) {
    console.log(Logger.formatMessage('info', message, data));
  }

  /**
   * Log de éxito
   */
  static success(message, data = null) {
    console.log(Logger.formatMessage('success', message, data));
  }

  /**
   * Log de debug (solo en desarrollo)
   */
  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      console.log(Logger.formatMessage('debug', message, data));
    }
  }

  /**
   * Log de sistema
   */
  static system(message, data = null) {
    console.log(Logger.formatMessage('system', message, data));
  }

  /**
   * Separador visual
   */
  static separator(title = '') {
    const { colors } = Logger;
    const line = '='.repeat(80);
    if (title) {
      const padding = Math.max(0, (80 - title.length - 2) / 2);
      const paddedTitle = ' '.repeat(Math.floor(padding)) + title + ' '.repeat(Math.ceil(padding));
      console.log(`${colors.cyan}${colors.bright}${paddedTitle}${colors.reset}`);
    } else {
      console.log(`${colors.gray}${line}${colors.reset}`);
    }
  }

  /**
   * Log de inicio de operación
   */
  static startOperation(operation) {
    Logger.separator(`INICIANDO: ${operation.toUpperCase()}`);
    Logger.system(`Iniciando operación: ${operation}`);
  }

  /**
   * Log de fin de operación
   */
  static endOperation(operation, success = true, duration = null) {
    const status = success ? 'COMPLETADO' : 'FALLIDO';
    const message = `Operación ${success ? 'completada' : 'fallida'}: ${operation}`;
    
    if (duration) {
      Logger[success ? 'success' : 'error'](`${message} (${duration}ms)`);
    } else {
      Logger[success ? 'success' : 'error'](message);
    }
    
    Logger.separator(`${status}: ${operation.toUpperCase()}`);
  }

  /**
   * Log de request HTTP
   */
  static httpRequest(method, url, statusCode = null, duration = null) {
    const { colors } = Logger;
    let message = `${colors.bright}${method}${colors.reset} ${url}`;
    
    if (statusCode && duration !== null) {
      const statusColor = statusCode >= 400 ? 'red' : statusCode >= 300 ? 'yellow' : 'green';
      message += ` ${colors[statusColor]}${statusCode}${colors.reset} ${colors.gray}(${duration}ms)${colors.reset}`;
    }
    
    console.log(Logger.formatMessage('info', message));
  }
}

module.exports = Logger;
