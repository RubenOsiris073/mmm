import apiService from '../../../services/apiService';

class DetectionService {
  constructor() {
    this.MIN_CONFIDENCE = 70;
  }

  /**
   * Busca un producto por etiqueta con diferentes estrategias de búsqueda
   */
  findProductByLabel(label, products) {
    if (!label || !products) return null;
    
    const normalizedLabel = label.toString().toLowerCase().trim();
    
    // Búsqueda exacta
    let product = products.find(p => 
      (p.label && p.label.toLowerCase() === normalizedLabel) || 
      (p.nombre && p.nombre.toLowerCase() === normalizedLabel)
    );
    
    // Búsqueda parcial
    if (!product) {
      product = products.find(p => 
        (p.label && p.label.toLowerCase().includes(normalizedLabel)) || 
        (p.nombre && p.nombre.toLowerCase().includes(normalizedLabel))
      );
    }
    
    // Búsqueda inversa para etiquetas largas
    if (!product && normalizedLabel.length > 3) {
      product = products.find(p => 
        (p.label && normalizedLabel.includes(p.label.toLowerCase())) || 
        (p.nombre && normalizedLabel.includes(p.nombre.toLowerCase()))
      );
    }
    
    return product;
  }

  /**
   * Procesa la respuesta del servidor de detección
   */
  processDetectionResponse(response) {
    if (!response) {
      throw new Error("La respuesta del servidor está vacía");
    }

    let detection = null;
    let source = "";

    // Diferentes formatos de respuesta del servidor
    if (response.success && response.detection) {
      detection = response.detection;
      source = "formato-success";
    } else if (response.detections && response.detections.length > 0) {
      const sortedDetections = [...response.detections].sort(
        (a, b) => (b.confidence || b.score || 0) - (a.confidence || a.score || 0)
      );
      detection = sortedDetections[0];
      source = "formato-array";
    } else if (response.detection) {
      detection = response.detection;
      source = "formato-legacy";
    }

    if (!detection) {
      throw new Error("No se encontró una estructura de detección válida");
    }

    return this.formatDetection(detection, source);
  }

  /**
   * Formatea la detección con información estándar
   */
  formatDetection(detection, source) {
    const label = detection.label || detection.class || detection.name || "Desconocido";
    const confidence = detection.confidence || detection.score || detection.similarity / 100 || 0.5;
    const similarity = detection.similarity || Math.round(confidence * 100);

    return {
      ...detection,
      label,
      confidence,
      similarity,
      timestamp: new Date().toISOString(),
      source
    };
  }

  /**
   * Valida si la detección tiene suficiente confianza
   */
  isValidDetection(detection) {
    return detection && detection.similarity >= this.MIN_CONFIDENCE;
  }

  /**
   * Detecta productos desde imagen
   */
  async detectFromImage(imageData) {
    if (!imageData) {
      throw new Error("No hay datos de imagen para procesar");
    }

    const response = await apiService.triggerDetection(imageData);
    const detection = this.processDetectionResponse(response);
    
    if (!this.isValidDetection(detection)) {
      throw new Error(`Detección poco confiable (${detection.similarity}%). Intente nuevamente.`);
    }

    return detection;
  }
}

const detectionService = new DetectionService();
export default detectionService;