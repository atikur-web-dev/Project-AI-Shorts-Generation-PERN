import multer from 'multer';
import path from 'path';
import { mkdirSync } from 'fs';

// Temp folder create
const tempDir = path.resolve(process.cwd(), 'temp');
mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
  },
});

// File filter only image
const fileFilter = (_req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});