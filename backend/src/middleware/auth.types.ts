import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}
export interface JwtUserPayload {
  userId: string;
  role: string;
}

