const NodeWebcam = require('node-webcam');
const fs = require('fs');
const path = require('path');

// Configurar webcam
const Webcam = NodeWebcam.create({
  width: 1280,
  height: 720,
  quality: 100,
  delay: 0,
  saveShots: true,
  output: "jpeg",
  device: false,
  callbackReturn: "location",
  verbose: false
});

/**
 * Captura una imagen con la webcam
 * @returns {Promise<string>} ruta de la imagen capturada
 */
async function captureImage() {
  // Crear directorio temporal si no existe
  const tempDir = path.join(__dirname, '..', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const imagePath = path.join(tempDir, `capture-${Date.now()}.jpg`);
  
  return new Promise((resolve, reject) => {
    Webcam.capture(imagePath, (err, data) => {
      if (err) {
        console.error("Error capturando imagen:", err);
        reject(err);
        return;
      }
      console.log("Imagen capturada correctamente");
      resolve(imagePath);
    });
  });
}

/**
 * Elimina una imagen temporal
 */
function cleanupImage(imagePath) {
  fs.unlink(imagePath, (err) => {
    if (err) console.error("Error eliminando imagen temporal:", err);
  });
}

module.exports = {
  captureImage,
  cleanupImage
};