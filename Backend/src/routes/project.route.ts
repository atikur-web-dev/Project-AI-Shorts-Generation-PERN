// Backend/src/routes/project.route.ts
import { Router } from 'express';
import { createProject, generateVideo } from '../controller/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createProjectSchema, generateVideoSchema } from '../utils/validators.js';

const router = Router();

router.post(
  '/projects',
  authenticate,
  upload.fields([
    { name: 'productImage', maxCount: 1 },
    { name: 'modelImage', maxCount: 1 },
  ]),
  validate(createProjectSchema),
  createProject
);

router.post(
  '/projects/generate-video',
  authenticate,
  validate(generateVideoSchema),
  generateVideo
);

export const projectRouter = router;