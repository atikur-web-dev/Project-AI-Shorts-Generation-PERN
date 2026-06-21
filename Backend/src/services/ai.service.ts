// Backend/src/services/ai.service.ts
import ai from "../config/ai.js";
import { convertToBase64 } from "../utils/image.helper.js";
import { uploadBufferToCloudinary } from "./cloudinary.service.js";
import { logger } from "../config/logger.js";
import type { Express } from "express";

interface GenerateImageInput {
  userPrompt?: string;
  aspectRatio?: string;
}

/**
 * CORE AI IMAGE GENERATOR SERVICE (Final Multimodal Version)
 * Safely merges Product + Model images using the powerful Gemini 2.5 Engine
 */
export const generateImageWithAI = async (
  productImage: Express.Multer.File,
  modelImage: Express.Multer.File,
  body: GenerateImageInput,
): Promise<string> => {
  try {
    // ১. ছবি দুটিকে গুগলের অফিশিয়াল inlineData খামে রূপান্তর করো
    const productPart = convertToBase64(productImage.path, productImage.mimetype);
    const modelPart = convertToBase64(modelImage.path, modelImage.mimetype);

    // ২. এআই-এর জন্য নিখুঁত প্রম্পট তৈরি করো
    const userPrompt = body.userPrompt || "";
    const promptText = `Task: Look at these two images. One is a product and the other is a model person. 
    Combine the person and product into a completely new, realistic single e-commerce image. 
    Make the person naturally hold or use the product. Match the lighting, shadows, scale and perspective perfectly. 
    The final output must be ONLY the raw image bytes data. Do not write any markdown code blocks, explanation or chat.
    User Extra Customization: ${userPrompt}`;

    logger.info("Sending multimodal images to Google Gemini Engine...");

    // ৩. গুগলের অফিশিয়াল মাল্টিমোডাল মডেল এবং মেথড কল করো (The Real Fix)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // 💡 গুগলের ২০২৬ সালের সবচেয়ে ফাস্ট ও একটিভ মাল্টিমোডাল মডেল
      contents: [
        { text: promptText },
        productPart, // প্রোডাক্টের বেইজ-৬৪ ডাটা খাম
        modelPart,   // মডেলের বেইজ-৬৪ ডাটা খাম
      ],
      config: {
        responseModalities: ["image"], // 💡 ছোট হাতের অক্ষরে মোডাল লক করা হলো
        temperature: 0.7, // ছবি রিয়ালিস্টিক রাখতে একটু শান্ত ক্রিয়েটিভিটি
      }
    });

    // 📂 ৪. এআই রেসপন্স থেকে ছবির ডাটা বের করো
    const parts = response?.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content parts returned from Gemini API");
    }

    let buffer: Buffer | null = null;
    // লুপ চালিয়ে ভেতরের জাদুকরী inlineData বা ছবির ডাটা খুঁজে বের করা
    for (const part of parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data as string;
        buffer = Buffer.from(imageData, "base64");
        break;
      }
    }

    if (!buffer) {
      throw new Error("Image buffer extraction failed from Gemini response");
    }

    // ৫. মেমরির বাফারটি ক্লাউডিনারির মেঘের লকারে আপলোড করো
    logger.info("Uploading fresh AI image buffer to Cloudinary...");
    const url = await uploadBufferToCloudinary(buffer);

    logger.info("AI Image successfully generated and saved to Cloudinary!");
    return url;

  } catch (error: any) {
    logger.error("AI Generation Service Engine failed:", error);
    throw new Error(`AI Engine Error: ${error.message || "Failed to process imagery"}`);
  }
};
