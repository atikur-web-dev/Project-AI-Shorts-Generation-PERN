// Backend/src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/index.js";

// Setup and configure Cloudinary with our secure storage credentials
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME, // Your unique cloud storage folder name
  api_key: config.CLOUDINARY_API_KEY,       // Public identifier key for Cloudinary
  api_secret: config.CLOUDINARY_API_SECRET, // Secret password key to authorize uploads safely
});

// Export the configured cloudinary machine so we can upload files to the cloud storage
export { cloudinary };
