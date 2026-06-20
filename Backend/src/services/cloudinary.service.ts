import { cloudinary } from '../lib/cloudinary.js';
import { logger } from '../config/logger.js';

export const uploadToCloudinary = async (
  filePath: string,
  folder: string = 'ai-shorts'
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (error) {
    logger.error('Cloudinary upload failed:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string = 'ai-shorts'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(new Error('Cloudinary upload failed'));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
};