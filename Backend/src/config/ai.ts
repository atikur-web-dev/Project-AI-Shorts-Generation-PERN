import { GoogleGenAI } from "@google/genai";
import { config } from "./index.js";

const ai = new GoogleGenAI({
    apiKey: config.CLOUDINARY_API_KEY,
});

export default ai;