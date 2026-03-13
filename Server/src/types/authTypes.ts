import { Request } from "express";

export interface UserData {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenData {
  userId: number;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}
