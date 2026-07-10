// Backend/src/utils/cloudinary.helper.ts
import { cloudinary } from '../lib/cloudinary.js';
import { logger } from '../config/logger.js';


export const uploadToCloudinary = async (
  filePath: string,
  folder: string = 'ai-shorts'
): Promise<string> => {
  try {
    // We use 'auto' so Cloudinary can accept both images and video files smoothly
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto', 
    });
    
    return result.secure_url;
  } catch (error) {
    logger.error('Cloudinary upload via path failed:', error);
    // Standard built-in JavaScript error since we don't have a separate error file
    throw new Error('Failed to upload file to Cloudinary');
  }
};

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string = 'ai-shorts'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder, 
        resource_type: 'auto' // Supports AI-generated video and image streams
      },
      (error, result) => {
        if (error || !result) {
          logger.error('Cloudinary buffer upload stream failed:', error);
          reject(new Error('Cloudinary stream upload failed'));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    
    // Send the raw data buffer into the stream pipeline
    uploadStream.end(buffer);
  });
};
