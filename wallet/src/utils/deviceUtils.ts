import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

/**
 * Obtiene información básica del dispositivo
 * @returns Objeto con información del dispositivo
 */
export const getDeviceInfo = async () => {
  try {
    // Datos básicos disponibles en todas las plataformas
    const deviceData = {
      platform: Platform.OS,
      platformVersion: Platform.Version,
      deviceName: await DeviceInfo.getDeviceName(),
      deviceId: DeviceInfo.getUniqueId(),
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      brand: DeviceInfo.getBrand(),
      model: DeviceInfo.getModel(),
      isTablet: DeviceInfo.isTablet(),
      timestamp: new Date().toISOString()
    };

    return deviceData;
  } catch (error) {
    console.error('Error al obtener información del dispositivo:', error);
    
    // Devolver información básica mínima en caso de error
    return {
      platform: Platform.OS,
      platformVersion: Platform.Version,
      timestamp: new Date().toISOString(),
      error: 'Error al obtener información completa del dispositivo'
    };
  }
};