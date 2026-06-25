import z from 'zod';

export const createProjectSchema = z.object({
  projectName: z.string().min(1).max(100).optional(),
  productName: z.string().min(1).max(100),
  productDescription: z.string().max(500).optional().nullable(),
  userPrompt: z.string().max(500).optional().nullable(),
  aspectRatio: z.enum(['9:16', '16:9', '1:1', '4:5']).default('9:16'),
});

export const generateVideoSchema = z.object({
  projectId: z.string().uuid(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type GenerateVideoInput = z.infer<typeof generateVideoSchema>;