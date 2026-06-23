import sharp from "sharp";
import { readFileSync } from "fs";

export const convertToBase64 = async (path: string, mimeType: string) => {
  try {
    const compressedBuffer = await sharp(path)
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 }) 
      .toBuffer();

    return {
      inlineData: compressedBuffer.toString("base64"),
    };
  } catch (error) {
    return {
      inlineData: readFileSync(path).toString("base64"),
    };
  }
};
