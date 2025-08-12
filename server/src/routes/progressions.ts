import { Router } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/auth";
const prisma = new PrismaClient();
const router = Router();
const ProgSchema = z.object({ name: z.string().optional(), chords: z.array(z.string()).length(4) });
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = ProgSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid" });
  const { name, chords } = parsed.data;
  const p = await prisma.progression.create({ data: { name, chords, userId: req.userId! } });
  res.json(p);
});
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const list = await prisma.progression.findMany({ where: { userId: req.userId! }, orderBy: { createdAt: "desc" } });
  res.json(list);
});
router.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  const id = req.params.id; const p = await prisma.progression.findUnique({ where: { id } });
  if (!p || p.userId !== req.userId) return res.status(404).json({ error: "not found" });
  await prisma.progression.delete({ where: { id } }); res.json({ ok: true });
});
export default router;