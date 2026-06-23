// Backend/src/routes/project.route.ts
import { Router } from 'express';
import { createProject, generateVideo } from '../controller/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.post(
  '/projects',
  authenticate,
  upload.fields([
    { name: 'productImage', maxCount: 1 },
    { name: 'modelImage', maxCount: 1 },
  ]),
  createProject
);
// video route
router.post('/projects/generate-video', authenticate, generateVideo);

export const projectRouter = router;