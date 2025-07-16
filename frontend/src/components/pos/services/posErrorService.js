/**
 * Servicio para manejo y logging de errores del POS
 */
class POSErrorService {
  static logError(error, errorInfo, context = 'POS') {
    const errorData = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: errorInfo ? {
        componentStack: errorInfo.componentStack
      } : null,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log en consola para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 POS Error - ${context}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Full Error Data:', errorData);
      console.groupEnd();
    }

    // En producción, aquí enviarías a un servicio de logging
    // como Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Ejemplo: Sentry.captureException(error, { extra: errorData });
      // O enviar a tu propio endpoint de logging
      this.sendToLoggingService(errorData);
    }

    return errorData;
  }

  static async sendToLoggingService(errorData) {
    try {
      // Aquí implementarías el envío a tu servicio de logging
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });
      console.log('Error logged:', errorData);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  static logPerformanceMetric(metricName, value, context = 'POS') {
    const metric = {
      timestamp: new Date().toISOString(),
      context,
      metric: metricName,
      value,
      url: window.location.href
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 POS Performance - ${metricName}:`, value);
    }

    // En producción, enviar métricas a servicio de analytics
    return metric;
  }
}

export default POSErrorService;