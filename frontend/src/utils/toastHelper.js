import { toast as originalToast } from 'react-toastify';

// Wrapper para toast que previene duplicados
const toast = {
  success: (message, options = {}) => {
    return originalToast.success(message, {
      toastId: options.toastId || `success-${Date.now()}`,
      ...options
    });
  },
  error: (message, options = {}) => {
    return originalToast.error(message, {
      toastId: options.toastId || `error-${Date.now()}`,
      ...options
    });
  },
  info: (message, options = {}) => {
    return originalToast.info(message, {
      toastId: options.toastId || `info-${Date.now()}`,
      ...options
    });
  },
  warning: (message, options = {}) => {
    return originalToast.warning(message, {
      toastId: options.toastId || `warning-${Date.now()}`,
      ...options
    });
  }
};

export { toast };
export default toast;
