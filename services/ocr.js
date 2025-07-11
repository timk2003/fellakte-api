const vision = require('@google-cloud/vision');

// Google Cloud Vision Client für EU-Region
const client = new vision.ImageAnnotatorClient({
  apiEndpoint: 'eu-vision.googleapis.com',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // oder process.env.GOOGLE_CLOUD_VISION_KEYFILE
});

/**
 * Führt OCR auf einem Bild durch (Buffer oder Base64)
 * @param {Buffer|string} imageBufferOrBase64
 * @returns {Promise<string>} erkannter Text
 */
async function runOcr(imageBufferOrBase64) {
  let image;
  if (Buffer.isBuffer(imageBufferOrBase64)) {
    image = { content: imageBufferOrBase64.toString('base64') };
  } else if (typeof imageBufferOrBase64 === 'string') {
    image = { content: imageBufferOrBase64 };
  } else {
    throw new Error('Ungültiges Bildformat');
  }

  const [result] = await client.textDetection({ image });
  const detections = result.textAnnotations;
  if (!detections || detections.length === 0) return '';
  return detections[0].description;
}

module.exports = { runOcr }; 