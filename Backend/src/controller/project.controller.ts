// Backend/src/controller/project.controller.ts

import type { Request, Response } from "express";
import {
  generateImageWithAI,
  generateVideoWithAI,
} from "../services/ai.service.js";

import { uploadToCloudinary } from "../services/cloudinary.service.js";
import { CreditService } from "../services/credit.service.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";
import { unlink } from "fs/promises";

export const createProject = async (req: Request, res: Response) => {
  let creditDeducted = false;

  const userId = req.user?.id;

  console.log("Create project request received");
  console.log("User ID:", userId);
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    // 1. Check credits
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        userSubscription: true,
      },
    });

    console.log("User credits:", user?.userSubscription?.credits);

    if (!user?.userSubscription || user.userSubscription.credits < 5) {
      return res.status(400).json({
        success: false,
        message: "Insufficient credits. Need at least 5 credits.",
      });
    }

    // 2. Get uploaded files
    interface UploadedFile {
      path: string;
      mimetype: string;
    }

    const files = req.files as {
      [fieldname: string]: UploadedFile[];
    };

    const productImage = files?.productImage?.[0];
    const modelImage = files?.modelImage?.[0];

    console.log("Product image:", productImage ? "present" : "missing");

    console.log("Model image:", modelImage ? "present" : "missing");

    if (!productImage || !modelImage) {
      return res.status(400).json({
        success: false,
        message: "Both product and model images are required",
      });
    }

    // 3. Deduct credits
    await prisma.userSubscription.update({
      where: {
        userId,
      },
      data: {
        credits: {
          decrement: 5,
        },
      },
    });

    creditDeducted = true;

    console.log("Credits deducted");

    // 4. Upload images to Cloudinary
    console.log("Uploading images to Cloudinary...");

    const [productUrl, modelUrl] = await Promise.all([
      uploadToCloudinary(productImage.path),
      uploadToCloudinary(modelImage.path),
    ]);

    console.log("Images uploaded successfully");

    // 5. Create project record
    console.log("Creating project record...");

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

    console.log("Project created with ID:", project.id);

    // 6. Generate AI image
    console.log("Generating AI image...");

    const generatedImage = await generateImageWithAI(productImage, modelImage, {
      userPrompt: req.body.userPrompt,
      aspectRatio: req.body.aspectRatio,
    });

    console.log("AI image generated");

    // 7. Update project with generated image
    const updatedProject = await prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        generatedImage,
      },
    });

    // 8. Cleanup temporary files
    await unlink(productImage.path).catch(() => {});
    await unlink(modelImage.path).catch(() => {});

    // 9. Response
    return res.json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    console.error("Project creation error:", error);

    // Refund credits if project generation failed
    if (creditDeducted) {
      try {
        await prisma.userSubscription.update({
          where: {
            userId,
          },
          data: {
            credits: {
              increment: 5,
            },
          },
        });

        logger.info(`Credits refunded for user ${userId}`);
      } catch (refundError) {
        logger.error("Credit refund failed:", refundError);
      }
    }

    logger.error("Project creation failed:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Project creation failed. Credits refunded.",
    });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  console.log("GET PROJECTS USER ID:", userId);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("GET PROJECTS RESULT:", projects);

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    logger.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get projects",
    });
  }
};

export const generateVideo = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Project ID is required and must be a string",
    });
  }

  let creditDeducted = false;

  try {
    // 1. Check credits
    const hasCredits = await CreditService.checkCredits(userId, 10);

    if (!hasCredits) {
      return res.status(400).json({
        success: false,
        message: "Insufficient credits. Need 10 credits for video generation.",
      });
    }

    // 2. Find project + ownership check
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    // 3. Prevent duplicate generation
    if (project.generatedVideo) {
      return res.status(400).json({
        success: false,
        message: "Video already generated for this project",
        data: {
          videoUrl: project.generatedVideo,
        },
      });
    }

    // 4. Deduct credits
    await CreditService.deductCredits(userId, 10);

    creditDeducted = true;

    // 5. Generate video
    const videoUrl = await generateVideoWithAI(project);

    // 6. Save generated video URL
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        generatedVideo: videoUrl,
      },
    });

    return res.json({
      success: true,
      message: "Video generated successfully",
      data: updatedProject,
    });
  } catch (error) {
    // Refund credits if generation failed
    if (creditDeducted) {
      try {
        await CreditService.refundCredits(userId, 10);

        logger.info(`Credits refunded for user ${userId}`);
      } catch (refundError) {
        logger.error("Credit refund failed:", refundError);
      }
    }

    logger.error("Video generation failed:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Video generation failed. Credits refunded.",
    });
  }
};
