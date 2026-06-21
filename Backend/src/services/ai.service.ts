import {
  HarmBlockThreshold,
  HarmCategory,
  type GenerateContentConfig,
} from "@google/genai";
import ai from "../config/ai.js";
import { convertToBase64 } from "../utils/image.helper.js";
import { uploadBufferToCloudinary } from "./cloudinary.service.js";
import { logger } from "../config/logger.js";
import type { Express } from "express";

interface GenerateImageInput {
  userPrompt?: string;
  aspectRatio?: string;
}

export const generateImageWithAI = async (
  productImage: Express.Multer.File,
  modelImage: Express.Multer.File,
  body: GenerateImageInput,
): Promise<string> => {
  try {
    // 1. Safety settings
    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: body.aspectRatio || "9:16",
        imageSize: "1k",
      },
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

    // 2. Convert images to base64
    const product = convertToBase64(productImage.path, productImage.mimetype);
    const model = convertToBase64(modelImage.path, modelImage.mimetype);

    // 3. Build prompt
    const userPrompt = body.userPrompt || "";
    const promptText = `Combine the person and product into realistic e-commerce imagery. Make the person naturally hold or use the product. Match lighting, shadows, scale and perspective. Make the person stand in professional studio lighting. Output e-commerce quality image realistic imagery ${userPrompt}`;

    const contents = [{ text: promptText }, product, model];

    // 4. Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents,
      config: generationConfig,
    });

    // 5. Extract image buffer
    const parts = response?.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No image generated");
    }

    let buffer: Buffer | null = null;
    for (const part of parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data as string;
        buffer = Buffer.from(imageData, "base64");
        break;
      }
    }

    if (!buffer) {
      throw new Error("Image generation failed");
    }

    // 6. Upload to Cloudinary
    const url = await uploadBufferToCloudinary(buffer);

    logger.info("Image generated and uploaded successfully");
    return url;
  } catch (error) {
    logger.error("AI generation failed:", error);
    throw new Error("Failed to generate image");
  }
};
