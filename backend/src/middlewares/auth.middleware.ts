import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { AuthRequest, JwtUserPayload } from "./auth.types";

import { AppDataSource } from "../config/data-source";
import { BlacklistedToken } from "../modules/auth/token.entity";

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // ✅ blacklist check
    const blacklistRepo = AppDataSource.getRepository(BlacklistedToken);
    const blacklisted = await blacklistRepo.findOne({ where: { token } });

    if (blacklisted) {
      return res.status(401).json({ message: "Token revoked" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtUserPayload;

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
