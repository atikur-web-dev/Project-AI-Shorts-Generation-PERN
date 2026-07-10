// Backend/src/types/auth.types.ts
import type { JwtPayload } from "jsonwebtoken";
export interface AuthPayload extends JwtPayload {
  userId: string;
}

export interface GoogleUserInfo {
  id: string;      
  email: string;   
  name: string;    
  picture: string; 
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}


export interface SessionData {
  accessToken: string;  
  refreshToken: string; 
  user: {
    id: string;          
    email: string;      
    name: string;       
    picture: string | null; 
  };
}
