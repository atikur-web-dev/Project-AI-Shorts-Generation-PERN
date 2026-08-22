// Frontend/src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  loginType: 'google' | 'github' | 'email';
  role: 'USER' | 'ADMIN';
  userSubscription?: UserSubscription;
}

export interface Project {
  id: string;
  projectName: string;
  productName: string;
  productDescription?: string;
  userPrompt?: string;
  productImage: string;
  modelImage: string;
  generatedImage: string;
  generatedVideo: string;
  aspectRatio: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface UserSubscription {
  id: string;
  credits: number;
  subscriptionId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken?: string;
  user?: User;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
