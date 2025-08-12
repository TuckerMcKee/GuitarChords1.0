import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";
import type { AuthedRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, email: true, createdAt: true }
  });
  res.json(user);
});

export default router;

