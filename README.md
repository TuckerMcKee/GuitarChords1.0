# Guitar Chord Generator
Single-page app that generates four-chord progressions with chord names and SVGuitar diagrams.
- Client: Vite + React + TypeScript, SVGuitar, html2canvas, jsPDF
- Server: Express + TypeScript, Prisma + Postgres, JWT auth (httpOnly cookie)
- Features: login, save progressions, export PNG/PDF

## Local development

Start a local Postgres instance (via Docker) and run both the client and server:

```bash
npm run local
```

The script spins up a `postgres` container with the database `guitar_chords`,
pushes the Prisma schema, and runs `npm run dev`.
