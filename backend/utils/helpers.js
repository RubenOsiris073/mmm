/**
 * Procesa diferentes tipos de timestamp a formato ISO
 */
function processTimestamp(timestamp) {
    if (!timestamp) return new Date().toISOString();
    
    try {
      if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
      } else if (timestamp instanceof Date) {
        return timestamp.toISOString();
      } else if (typeof timestamp === 'string') {
        return timestamp;
      } else if (typeof timestamp === 'number') {
        return new Date(timestamp).toISOString();
      }
    } catch (e) {
      console.error("Error procesando timestamp:", e);
    }
    
    return new Date().toISOString();
  }
  
  module.exports = {
    processTimestamp
  };