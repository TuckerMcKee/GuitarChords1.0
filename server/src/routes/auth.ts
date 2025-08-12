import { Router } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();
const router = Router();
const AuthSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
function setAuthCookie(res: any, token: string) {
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: false, maxAge: 1000*60*60*24*7 });
}
router.post("/register", async (req, res) => {
  const parsed = AuthSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid" });
  const { email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "exists" });
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, passwordHash } });
  res.json({ ok: true });
});
router.post("/login", async (req, res) => {
  const parsed = AuthSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid" });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "bad creds" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "bad creds" });
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || "changeme", { expiresIn: "7d" });
  setAuthCookie(res, token); res.json({ ok: true });
});
router.post("/logout", async (_req, res) => { res.clearCookie("token"); res.json({ ok: true }); });
export default router;