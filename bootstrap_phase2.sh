#!/usr/bin/env bash
set -euo pipefail

# --- helpers ---
ensure_file() {
  local path="$1"; shift
  local content="$*"
  if [ -f "$path" ]; then
    echo "skip: $path"
  else
    mkdir -p "$(dirname "$path")"
    printf "%s" "$content" > "$path"
    echo "create: $path"
  fi
}

# ---------- CLIENT ----------
if [ ! -d client ]; then
  mkdir client
  pushd client >/dev/null
  npm init -y >/dev/null
  npm create vite@latest . -- --template react-ts >/dev/null || true
  npm i svguitar axios react-router-dom html2canvas jspdf >/dev/null
  popd >/div/null 2>/dev/null || popd >/dev/null || true
fi

ensure_file client/vite.config.ts 'import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: { outDir: "dist" }
});
'

ensure_file client/src/lib/api.ts 'import axios from "axios";
export const api = axios.create({ baseURL: "http://localhost:3001", withCredentials: true });'

ensure_file client/src/lib/chords.ts 'export type ChordName = string;
const KEYS = ["C","G","D","A","E","B","F#","Db","Ab","Eb","Bb","F"];
const DEGREE_ORDER = ["I","vi","IV","V"];
const CHROMA = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
function transpose(keyIndex:number, semis:number){ return CHROMA[(keyIndex+semis+12)%12]; }
export function generateProgression(key?: string): ChordName[] {
  const k = key && KEYS.includes(key) ? key : KEYS[Math.floor(Math.random()*KEYS.length)];
  const norm = k.replace("Db","C#").replace("Eb","D#").replace("Ab","G#");
  const keyIndex = CHROMA.indexOf(norm);
  const map:any = { I:0, vi:9, IV:5, V:7 };
  return DEGREE_ORDER.map((deg)=> {
    const root = transpose(keyIndex, map[deg]);
    const suffix = deg === "vi" ? "m" : "";
    return `${root}${suffix}`;
  });
}'

ensure_file client/src/components/ChordDiagram.tsx 'import React, { useEffect } from "react";
import { Chord } from "svguitar";
export default function ChordDiagram({ chordName, id }: { chordName: string; id: string }) {
  useEffect(() => {
    const el = document.getElementById(id) as HTMLDivElement | null;
    if (!el) return;
    el.innerHTML = "";
    const chord = new Chord(el, { style: { color: "#111" } });
    chord.draw({ chord: [], fingers: [], barres: [], position: 0, name: chordName });
  }, [chordName, id]);
  return <div id={id} style={{ width: 180, height: 220 }} />;
}'

ensure_file client/src/pages/Auth.tsx 'import React, { useState } from "react";
import { api } from "../lib/api";
export default function AuthPage() {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [mode, setMode] = useState<"login"|"register">("login");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") await api.post("/auth/register", { email, password: pw });
    await api.post("/auth/login", { email, password: pw });
    alert("Logged in."); setEmail(""); setPw("");
  };
  return (
    <div style={{ maxWidth: 360, margin: "2rem auto" }}>
      <h2>{mode}</h2>
      <form onSubmit={submit}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
        <input placeholder="password" type="password" value={pw} onChange={e=>setPw(e.target.value)} /><br/>
        <button type="submit">{mode}</button>{" "}
        <button type="button" onClick={()=>setMode(mode==="login"?"register":"login")}>
          switch to {mode==="login"?"register":"login"}
        </button>
      </form>
    </div>
  );
}'

ensure_file client/src/pages/Home.tsx 'import React, { useRef, useState } from "react";
import { generateProgression } from "../lib/chords";
import ChordDiagram from "../components/ChordDiagram";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { api } from "../lib/api";
export default function Home() {
  const [chords, setChords] = useState<string[]>(generateProgression());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const regenerate = () => setChords(generateProgression());
  const save = async () => { await api.post("/progressions", { name: "My Progression", chords }); alert("Saved"); };
  const exportPNG = async () => {
    if (!containerRef.current) return; const canvas = await html2canvas(containerRef.current);
    const a = document.createElement("a"); a.href = canvas.toDataURL("image/png"); a.download = "progression.png"; a.click();
  };
  const exportPDF = async () => {
    if (!containerRef.current) return; const canvas = await html2canvas(containerRef.current);
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height); pdf.save("progression.pdf");
  };
  return (
    <div style={{ padding: 16 }}>
      <h1>Four-Chord Generator</h1>
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <button onClick={regenerate}>Generate progression</button>
        <button onClick={save}>Save</button>
        <button onClick={exportPNG}>Export PNG</button>
        <button onClick={exportPDF}>Export PDF</button>
      </div>
      <div ref={containerRef} style={{ display: "flex", gap: 16 }}>
        {chords.map((c, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <strong>{c}</strong>
            <ChordDiagram chordName={c} id={`chord-${i}`} />
          </div>
        ))}
      </div>
    </div>
  );
}'

ensure_file client/src/App.tsx 'import React from "react";
import { Route, Routes, Link, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import AuthPage from "./pages/Auth";
export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 12, borderBottom: "1px solid #ddd", marginBottom: 16 }}>
        <Link to="/">Home</Link>{" | "}
        <Link to="/auth">Login/Register</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}'

# ---------- SERVER ----------
if [ ! -d server ]; then
  mkdir server
  pushd server >/dev/null
  npm init -y >/dev/null
  npm i express cookie-parser cors jsonwebtoken bcrypt zod @prisma/client >/dev/null
  npm i -D typescript ts-node-dev @types/express @types/cookie-parser @types/cors @types/jsonwebtoken @types/bcrypt prisma >/dev/null
  npx tsc --init >/dev/null
  npx prisma init >/dev/null || true
  popd >/div/null 2>/dev/null || popd >/dev/null || true
fi

ensure_file server/tsconfig.json '{
  "compilerOptions": {
    "target": "ES2020", "module": "CommonJS", "rootDir": "src", "outDir": "dist",
    "esModuleInterop": true, "strict": true, "skipLibCheck": true
  }, "include": ["src"]
}'

ensure_file server/package.json '{
  "name": "server",
  "version": "1.0.0",
  "type": "commonjs",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  }
}'

ensure_file server/prisma/schema.prisma 'generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  progressions Progression[]
}
model Progression {
  id        String   @id @default(cuid())
  name      String?
  chords    String[]
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
}'

ensure_file server/src/index.ts 'import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import progRouter from "./routes/progressions";
const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRouter);
app.use("/progressions", progRouter);
app.listen(PORT, () => console.log(`API listening on :${PORT}`));'

ensure_file server/src/middleware/auth.ts 'import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export interface AuthedRequest extends Request { userId?: string; }
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = (req as any).cookies?.token;
  if (!token) return res.status(401).json({ error: "unauthenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme") as { sub: string };
    req.userId = decoded.sub; next();
  } catch { return res.status(401).json({ error: "invalid token" }); }
}'

ensure_file server/src/routes/auth.ts 'import { Router } from "express";
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
export default router;'

ensure_file server/src/routes/progressions.ts 'import { Router } from "express";
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
export default router;'

# Root package.json (ensure workspaces & scripts)
ensure_file package.json '{
  "name": "guitar-chord-app",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "npm run dev -w client & npm run dev -w server",
    "build": "npm -w client run build && npm -w server run build"
  }
}'

# .env example at root (if missing)
if [ ! -f .env.example ]; then
  printf "%s" "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/guitar_chords
JWT_SECRET=change-me
CORS_ORIGIN=http://localhost:5173
PORT=3001
" > .env.example
fi

echo "Done. Next steps:
1) cp server/.env.example server/.env && edit values
2) Start Postgres (or use Docker)
3) cd server && npx prisma migrate dev --name init && cd ..
4) npm run dev
Client: http://localhost:5173   API: http://localhost:3001/healthz"
