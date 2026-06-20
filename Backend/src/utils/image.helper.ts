// Backend/src/utils/image.helper.ts
import { readFileSync } from "fs";

export const convertToBase64 = (path: string, mimeType: string) => {
  return {
    inlineData: {
      mimeType,
      data: readFileSync(path).toString("base64"),
    },
  };
};
