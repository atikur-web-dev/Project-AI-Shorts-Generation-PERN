// Backend/src/controllers/project.controller.ts
import type { Request, Response } from "express";
import { generateImageWithAI } from "../services/ai.service.js";
import { uploadToCloudinary } from "../services/cloudinary.service.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";
import { unlink } from "fs/promises";

export const createProject = async (req: Request, res: Response) => {
  let creditDeducted = false;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // 1. Check credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userSubscription: true },
    });

    if (!user?.userSubscription || user.userSubscription.credits < 5) {
      return res.status(400).json({
        success: false,
        message: "Insufficient credits. Need at least 5 credits.",
      });
    }

    // 2. Get uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const productImage = files?.productImage?.[0];
    const modelImage = files?.modelImage?.[0];

    if (!productImage || !modelImage) {
      return res.status(400).json({
        success: false,
        message: "Both product and model images are required",
      });
    }

    // 3. Deduct credits
    await prisma.userSubscription.update({
      where: { userId: userId },
      data: { credits: { decrement: 5 } },
    });
    creditDeducted = true;

    // 4. Upload product & model images to Cloudinary
    const [productUrl, modelUrl] = await Promise.all([
      uploadToCloudinary(productImage.path),
      uploadToCloudinary(modelImage.path),
    ]);

    // 5. Create project record
    const project = await prisma.project.create({
      data: {
        projectName: req.body.projectName || "Untitled",
        productName: req.body.productName || "Product",
        productDescription: req.body.productDescription || null,
        userPrompt: req.body.userPrompt || null,
        productImage: productUrl,
        modelImage: modelUrl,
        generatedImage: "",
        generatedVideo: "",
        aspectRatio: req.body.aspectRatio || "9:16",
        userId,
      },
    });

    // 6. Generate AI image
    const generatedImage = await generateImageWithAI(
      productImage,
      modelImage,
      {
        userPrompt: req.body.userPrompt,
        aspectRatio: req.body.aspectRatio,
      },
    );

    // 7. Update project with generated image
    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: { generatedImage },
    });

    // 8. Cleanup temp files
    await unlink(productImage.path).catch(() => {});
    await unlink(modelImage.path).catch(() => {});

    res.json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    // Refund credits if failed
    if (creditDeducted) {
      await prisma.userSubscription.update({
        where: { userId },
        data: { credits: { increment: 5 } },
      });
    }

    logger.error("Project creation failed:", error);
    res.status(500).json({
      success: false,
      message: "Project creation failed. Credits refunded.",
    });
  }
};
