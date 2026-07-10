const sharp = require('sharp');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * Compress image and upload to Cloudinary
 * @param {Buffer} buffer - image buffer from multer
 * @param {string} folder - folder path in Cloudinary
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadImage = async (buffer, folder = 'civicai/reports') => {
  // Compress with sharp
  const compressed = await sharp(buffer)
    .jpeg({ quality: 85 })
    .toBuffer();

  // Retry logic
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        const readableStream = Readable.from(compressed);
        readableStream.pipe(uploadStream);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw new Error(`Failed to upload image after ${maxRetries} attempts: ${error.message}`);
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

module.exports = { uploadImage };
