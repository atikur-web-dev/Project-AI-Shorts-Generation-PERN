import { cloudinary } from "../lib/cloudinary.js";
import { logger } from "../config/logger.js";

export const uploadToCloudinary = async (
  filePath: string,
  folder: string = "ai-short",
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    logger.error("Cloudinary upload filed: ", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};
