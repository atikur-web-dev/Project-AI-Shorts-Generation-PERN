// Backend/src/services/ai.service.ts

import {
  HarmBlockThreshold,
  HarmCategory,
  type GenerateContentConfig,
} from "@google/genai";

import ai from "../config/ai.js";
import { readFileSync } from "fs";
import { uploadBufferToCloudinary } from "./cloudinary.service.js";
import { logger } from "../config/logger.js";
import axios from "axios";
import fs, { mkdirSync } from "fs";
import path from "path";
import { cloudinary } from "../lib/cloudinary.js";
import type { Project } from "@prisma/client";
import type { Express } from "express";

interface GenerateImageInput {
  userPrompt?: string;
  aspectRatio?: string;
}

/**
 * ==========================
 * IMAGE GENERATION (GEMINI)
 * ==========================
 */
export const generateImageWithAI = async (
  productImage: Express.Multer.File,
  modelImage: Express.Multer.File,
  body: GenerateImageInput,
): Promise<string> => {
  try {
    const generationConfig: GenerateContentConfig = {
      responseModalities: ["TEXT", "IMAGE"],
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

    // Convert images → base64 inline parts
    const productPart = {
      inlineData: {
        mimeType: productImage.mimetype || "image/jpeg",
        data: readFileSync(productImage.path).toString("base64"),
      },
    };

    const modelPart = {
      inlineData: {
        mimeType: modelImage.mimetype || "image/jpeg",
        data: readFileSync(modelImage.path).toString("base64"),
      },
    };

    const promptText = `
Combine the person and product into realistic e-commerce imagery.
Make the person naturally hold or use the product.
Match lighting, shadows, scale, and perspective.
Aspect ratio: ${body.aspectRatio || "9:16"}.
Professional studio lighting, ultra realistic e-commerce quality.
${body.userPrompt || ""}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }, productPart, modelPart],
        },
      ],
      config: generationConfig,
    });

    const parts = response?.candidates?.[0]?.content?.parts;

    if (!parts) {
      throw new Error("No response parts returned from Gemini");
    }

    let buffer: Buffer | null = null;

    for (const part of parts) {
      if (part.inlineData?.data) {
        buffer = Buffer.from(part.inlineData.data, "base64");
        break;
      }
    }

    if (!buffer) {
      throw new Error("No generated image buffer found in response");
    }

    const url = await uploadBufferToCloudinary(buffer);

    logger.info("Image generated successfully");
    return url;
  } catch (error) {
    logger.error("AI generation failed:", error);
    throw new Error("Failed to generate image");
  }
};

/**
 * ==========================
 * VIDEO GENERATION (VEO)
 * ==========================
 */
export const generateVideoWithAI = async (
  project: Project,
): Promise<string> => {
  try {
    const prompt = `
Make the person showcase the product: ${project.productName}.
${project.productDescription || ""}
`;

    if (!project.generatedImage) {
      throw new Error("Generated image not found");
    }

    const imageResponse = await axios.get(project.generatedImage, {
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    let operation = await ai.models.generateVideos({
      model: "veo-3.1-generate-preview",
      prompt,
      image: {
        imageBytes: imageBuffer.toString("base64"),
        mimeType: "image/png",
      },
      config: {
        aspectRatio: project.aspectRatio || "9:16",
        numberOfVideos: 1,
        resolution: "720p",
      },
    });

    const maxAttempts = 30;
    let attempts = 0;

    while (!operation.done && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 10000));
      operation = await ai.operations.getVideosOperation({
        operation,
      });

      attempts++;
      logger.info(`Video generation progress: ${attempts * 10}s`);
    }

    if (!operation.done) {
      throw new Error("Video generation timed out");
    }

    if (operation?.response?.raiMediaFilteredReasons?.length) {
      throw new Error(operation.response.raiMediaFilteredReasons[0]);
    }

    const videoFile = operation?.response?.generatedVideos?.[0]?.video;

    if (!videoFile) {
      throw new Error("No video generated");
    }

    const videosDir = path.resolve(process.cwd(), "videos");
    mkdirSync(videosDir, { recursive: true });

    const filePath = path.join(videosDir, `video-${Date.now()}.mp4`);

    await ai.files.download({
      file: videoFile,
      downloadPath: filePath,
    });

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "ai-shorts",
      resource_type: "video",
    });

    await fs.promises.unlink(filePath).catch(() => {});
    await fs.promises.rm(videosDir, { recursive: true, force: true });

    logger.info("Video generated successfully");

    return uploadResult.secure_url;
  } catch (error) {
    logger.error("Video generation failed:", error);
    throw new Error("Failed to generate video");
  }
};