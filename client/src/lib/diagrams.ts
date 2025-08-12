import { Chord, OPEN, SILENT } from "svguitar";

const OPEN_CHORDS: Record<string, Chord> = {
  C: { fingers: [
    [1, OPEN], [2,1], [3,OPEN], [4,2], [5,3], [6,SILENT]
  ], barres: [] },
  D: { fingers: [
    [1,2],[2,3],[3,2],[4,OPEN],[5,SILENT],[6,SILENT]
  ], barres: [] },
  E: { fingers: [
    [1,OPEN],[2,OPEN],[3,1],[4,2],[5,2],[6,OPEN]
  ], barres: [] },
  G: { fingers: [
    [1,3],[2,OPEN],[3,OPEN],[4,OPEN],[5,2],[6,3]
  ], barres: [] },
  A: { fingers: [
    [1,OPEN],[2,2],[3,2],[4,2],[5,OPEN],[6,SILENT]
  ], barres: [] },
  Am: { fingers: [
    [1,OPEN],[2,1],[3,2],[4,2],[5,OPEN],[6,SILENT]
  ], barres: [] },
  Dm: { fingers: [
    [1,1],[2,3],[3,2],[4,OPEN],[5,SILENT],[6,SILENT]
  ], barres: [] },
  Em: { fingers: [
    [1,OPEN],[2,OPEN],[3,OPEN],[4,2],[5,2],[6,OPEN]
  ], barres: [] },
  F: { fingers: [
    [1,1],[2,1],[3,2],[4,3],[5,3],[6,1]
  ], barres: [{ fromString:6, toString:1, fret:1, text:"1" }] }
};

const CHROMA = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

export function getChordDiagram(name: string): Chord | null {
  if (OPEN_CHORDS[name]) return OPEN_CHORDS[name];
  const isMinor = name.endsWith("m");
  const root = name.replace(/m$/, "")
    .replace("Db","C#").replace("Eb","D#")
    .replace("Gb","F#").replace("Ab","G#").replace("Bb","A#");
  const openName = root + (isMinor ? "m" : "");
  if (OPEN_CHORDS[openName]) return OPEN_CHORDS[openName];
  const rootIndex = CHROMA.indexOf(root);
  if (rootIndex < 0) return null;
  const eIndex = CHROMA.indexOf("E");
  const offset = (rootIndex - eIndex + 12) % 12;
  const base = OPEN_CHORDS[isMinor ? "Em" : "E"];
  const fingers = base.fingers.map(([string, fret]) => {
    if (fret === SILENT) return [string, SILENT] as [number, typeof SILENT];
    if (fret === OPEN) return [string, offset === 0 ? OPEN : offset] as [number, number];
    return [string, (fret as number) + offset] as [number, number];
  });
  const barres = offset ? [{ fromString:6, toString:1, fret:offset, text:"1" }] : [];
  return { fingers, barres, position: offset > 1 ? offset : 1 };
}
