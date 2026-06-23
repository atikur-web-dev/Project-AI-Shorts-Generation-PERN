import { readFileSync } from 'fs';

function convertImageToBase64(path: string, mimeType: string) {
  if (!mimeType) {
    const ext = path.split('.').pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
    };
    mimeType = mimeMap[ext || ''] || 'image/jpeg';
  }

  return {
    inlineData: {
      mimeType,
      data: readFileSync(path).toString('base64'),
    },
  };
}

export default convertImageToBase64;