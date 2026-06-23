// Backend/src/services/ai.service.ts
import {
  HarmBlockThreshold,
  HarmCategory,
  type GenerateContentConfig,
} from '@google/genai';
import ai from '../config/ai.js';
import { convertToBase64 } from '../utils/image.helper.js';
import { uploadBufferToCloudinary } from './cloudinary.service.js';
import { logger } from '../config/logger.js';
import axios from 'axios';
import type { Express } from 'express';
import fs, { mkdirSync } from 'fs';
import path from 'path';
import { cloudinary } from '../lib/cloudinary.js';
import type { Project } from '@prisma/client';
interface GenerateImageInput {
  userPrompt?: string;
  aspectRatio?: string;
}

export const generateImageWithAI = async (
  productImage: Express.Multer.File,
  modelImage: Express.Multer.File,
  body: GenerateImageInput
): Promise<string> => {
  try {
    // 1. Safety settings & Generation Config
    const generationConfig: GenerateContentConfig = {
      responseModalities: ['TEXT', 'IMAGE'],
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    };

    // 2. Convert reference images using await for the new async sharp helper
    const productData = await convertToBase64(productImage.path, productImage.mimetype);
    const modelData = await convertToBase64(modelImage.path, modelImage.mimetype);

    // 3. Build text prompt instructions
    const userPrompt = body.userPrompt || '';
    const promptText = `Combine the person and product into realistic e-commerce imagery. 
    Make the person naturally hold or use the product. Match lighting, shadows, scale, aspect ratio (${body.aspectRatio || '9:16'}) and perspective. 
    Make the person stand in professional studio lighting. Output e-commerce quality image realistic imagery ${userPrompt}`;

    // 4. Call Gemini API passing explicitly cast parts objects
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: [
        {
          role: 'user',
          parts: [
            { text: promptText } as any,
            {
              inlineData: productData.inlineData,
              mimeType: productImage.mimetype,
            } as any,
            {
              inlineData: modelData.inlineData,
              mimeType: modelImage.mimetype,
            } as any,
          ],
        } as any,
      ],
      config: generationConfig,
    });

    // 5. Extract the generated image buffer
    const parts = response?.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error('No components returned in the generation content path');
    }

    let buffer: Buffer | null = null;
    for (const part of parts) {
      if (part.inlineData) {
        // The inlineData string is returned directly in the new SDK
        const imageData = part.inlineData as unknown as string;
        buffer = Buffer.from(imageData, 'base64');
        break;
      }
    }

    if (!buffer) {
      throw new Error('Image generation failed - No inline binary payload detected');
    }

    // 6. Upload compiled buffer directly to Cloudinary
    const url = await uploadBufferToCloudinary(buffer);

    logger.info('Image generated and uploaded successfully');
    return url;
  } catch (error) {
    logger.error('AI generation failed:', error);
    throw new Error('Failed to generate image');
  }
};

export const generateVideoWithAI = async (project: Project): Promise<string> => {
  try {
    // 1. Build prompt
    const prompt = `Make the person showcase the product which is ${project.productName}. ${project.productDescription || ''}`;
    
    // 2. Get the generated image
    if (!project.generatedImage) {
      throw new Error('Generated image not found. Please generate image first.');
    }

    // 3. Download the image
    const imageResponse = await axios.get(project.generatedImage, {
      responseType: 'arraybuffer',
    });
    const imageBuffer = Buffer.from(imageResponse.data);

    // 4. Start video generation
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt,
      image: {
        imageBytes: imageBuffer.toString('base64'),
        mimeType: 'image/png',
      },
      config: {
        aspectRatio: project.aspectRatio || '9:16',
        numberOfVideos: 1,
        resolution: '720p',
      },
    });

    // 5. Poll for completion (max 5 minutes)
    const maxAttempts = 30; // 30 * 10s = 5 minutes
    let attempts = 0;
    
    while (!operation.done && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
      attempts++;
      logger.info(`Video generation progress: ${attempts * 10}s`);
    }

    if (!operation.done) {
      throw new Error('Video generation timed out');
    }

    // 6. Check for safety filters
    if (operation?.response?.raiMediaFilteredReasons?.length) {
      throw new Error(operation.response.raiMediaFilteredReasons[0]);
    }

    if (!operation?.response?.generatedVideos?.[0]?.video) {
      throw new Error('No video generated');
    }

    // 7. Download video
    const videosDir = path.resolve(process.cwd(), 'videos');
    mkdirSync(videosDir, { recursive: true });

    const fileName = `video-${Date.now()}.mp4`;
    const filePath = path.join(videosDir, fileName);

    await ai.files.download({
      file: operation.response.generatedVideos[0].video,
      downloadPath: filePath,
    });

    // 8. Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: 'ai-shorts',
      resource_type: 'video',
    });

    // 9. Cleanup
    await fs.promises.unlink(filePath).catch(() => {});
    await fs.promises.rmdir(videosDir).catch(() => {});

    logger.info('Video generated and uploaded successfully');
    return uploadResult.secure_url;
  } catch (error) {
    logger.error('Video generation failed:', error);
    throw new Error('Failed to generate video');
  }
};