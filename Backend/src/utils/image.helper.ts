import sharp from "sharp";
import { readFileSync } from "fs";

export const convertToBase64 = async (path: string, mimeType: string) => {
  try {
    // ছবিটিকে ১০২৪ পিক্সেলের মধ্যে রিসাইজ এবং ৮০% কোয়ালিটিতে কম্প্রেস করা হচ্ছে
    const compressedBuffer = await sharp(path)
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 }) 
      .toBuffer();

    return {
      inlineData: compressedBuffer.toString("base64"),
    };
  } catch (error) {
    // sharp কোনো কারণে ফেইল করলে ব্যাকআপ হিসেবে মূল ফাইলটিকেই কনভার্ট করবে
    return {
      inlineData: readFileSync(path).toString("base64"),
    };
  }
};
