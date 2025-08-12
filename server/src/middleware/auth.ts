import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request { userId?: string; }

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = (req as any).cookies?.token;
  if (!token) return res.status(401).json({ error: "unauthenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme") as { sub: string };
    req.userId = decoded.sub; next();
  } catch { return res.status(401).json({ error: "invalid token" }); }
}
