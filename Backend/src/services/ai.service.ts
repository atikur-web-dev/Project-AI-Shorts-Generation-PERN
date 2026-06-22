import {
  HarmBlockThreshold,
  HarmCategory,
  type GenerateContentConfig,
} from '@google/genai';
import ai from '../config/ai.js';
import { convertToBase64 } from '../utils/image.helper.js';
import { uploadBufferToCloudinary } from './cloudinary.service.js';
import { logger } from '../config/logger.js';
import type { Express } from 'express';

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
