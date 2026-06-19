// src/Controller/index.ts
// Barrel file - exports all controllers

// Google auth
export { 
  googleLogin, 
  googleCallback 
} from "./auth-google.controller.js";

// GitHub auth
export { 
  githubLogin, 
  githubCallback 
} from "./auth-github.controller.js";

// Core auth
export { 
  logout, 
  refreshToken, 
  getMe 
} from "./auth.controller.js";