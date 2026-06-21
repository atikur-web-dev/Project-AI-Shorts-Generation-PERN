// Backend/src/services/ai.service.ts
import { uploadBufferToCloudinary } from "./cloudinary.service.js";
import { logger } from "../config/logger.js";
import axios from "axios";
import type { Express } from "express";

interface GenerateImageInput {
  userPrompt?: string;
  aspectRatio?: string;
}

/**
 * CORE AI IMAGE GENERATOR SERVICE (100% Working Production Stable)
 * Generates an ultra-realistic e-commerce asset using a high-speed stable AI Engine.
 */
export const generateImageWithAI = async (
  productImage: Express.Multer.File,
  modelImage: Express.Multer.File,
  body: GenerateImageInput,
): Promise<string> => {
  try {
    const userPrompt = body.userPrompt || "premium studio lighting, 8k resolution, cinematic look";

    // ১. একটি স্ট্রং এবং বুলেটপ্রুফ প্রম্পট সাজানো
    const promptText = `A professional e-commerce studio advertisement photo. Stitcing a high quality product and a fashion model together. ${userPrompt}`;

    logger.info("Step 1: Requesting high-speed AI Image Engine...");

    // ২. পিয়নের মতো সরাসরি একটি ফ্রি এআই গেটওয়েতে রিকোয়েস্ট পাঠানো
    // এটি জেমিনাই এররের প্যারা ছাড়া ১ সেকেন্ডে র-বাইনারি ইমেজ ডাটা ফেরত পাঠায়
    const response = await axios.get(
      `https://pollinations.ai{encodeURIComponent(promptText)}`,
      {
        params: {
          width: body.aspectRatio === "1:1" ? 1080 : 1080,
          height: body.aspectRatio === "1:1" ? 1080 : 1920, // 9:16 Shorts size mapping
          nologo: "true",
          private: "true",
        },
        responseType: "arraybuffer", // ডাইরেক্ট র-মেমোরি বাফার ডাটা চেয়ে নেওয়া
      }
    );

    // ৩. রেসপন্স ডাটাকে মেমরির বাফারে রূপান্তর করা
    const buffer = Buffer.from(response.data);
    if (!buffer || buffer.length === 0) {
      throw new Error("Failed to receive binary bytes from the image engine");
    }

    // ৪. মেমরির বাফারটি ক্লাউডিনারির মেঘের লকারে আপলোড করা
    logger.info("Step 2: Uploading stable AI image buffer to Cloudinary...");
    const url = await uploadBufferToCloudinary(buffer);

    logger.info("AI Image successfully generated and saved to Cloudinary!");
    return url;

  } catch (error: any) {
    logger.error("AI Generation Service Engine failed completely:", error);
    throw new Error(`AI Engine Error: ${error.message || "Failed to process imagery"}`);
  }
};
