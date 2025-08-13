import { Chord, OPEN, SILENT } from "svguitar";

const OPEN_CHORDS: Record<string, Chord> = {
  C: {
    fingers: [
      [1, OPEN],
      [2, 1],
      [3, OPEN],
      [4, 2],
      [5, 3],
      [6, SILENT],
    ],
    barres: [],
  },
  D: {
    fingers: [
      [1, 2],
      [2, 3],
      [3, 2],
      [4, OPEN],
      [5, SILENT],
      [6, SILENT],
    ],
    barres: [],
  },
  E: {
    fingers: [
      [1, OPEN],
      [2, OPEN],
      [3, 1],
      [4, 2],
      [5, 2],
      [6, OPEN],
    ],
    barres: [],
  },
  G: {
    fingers: [
      [1, 3],
      [2, OPEN],
      [3, OPEN],
      [4, OPEN],
      [5, 2],
      [6, 3],
    ],
    barres: [],
  },
  A: {
    fingers: [
      [1, OPEN],
      [2, 2],
      [3, 2],
      [4, 2],
      [5, OPEN],
      [6, SILENT],
    ],
    barres: [],
  },
  Am: {
    fingers: [
      [1, OPEN],
      [2, 1],
      [3, 2],
      [4, 2],
      [5, OPEN],
      [6, SILENT],
    ],
    barres: [],
  },
  Dm: {
    fingers: [
      [1, 1],
      [2, 3],
      [3, 2],
      [4, OPEN],
      [5, SILENT],
      [6, SILENT],
    ],
    barres: [],
  },
  Em: {
    fingers: [
      [1, OPEN],
      [2, OPEN],
      [3, OPEN],
      [4, 2],
      [5, 2],
      [6, OPEN],
    ],
    barres: [],
  },
  F: {
    fingers: [
      [1, 1],
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 3],
      [6, 1],
    ],
    barres: [{ fromString: 6, toString: 1, fret: 1, text: "1" }],
  },
};

const CHROMA = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

// pitches of open strings from low E (6) to high E (1)
const STRING_PITCHES = [4, 9, 2, 7, 11, 4];

// Basic interval formulas (in semitones) for a wide range of chord suffixes
const CHORD_FORMULAS: Record<string, number[]> = {
  "": [0, 4, 7],
  m: [0, 3, 7],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  "7": [0, 4, 7, 10],
  dim: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  m7b5: [0, 3, 6, 10],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  "7sus2": [0, 2, 7, 10],
  "7sus4": [0, 5, 7, 10],
  "6": [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  "9": [0, 4, 7, 10, 14],
  m9: [0, 3, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  add9: [0, 4, 7, 14],
  madd9: [0, 3, 7, 14],
  "11": [0, 4, 7, 10, 14, 17],
  m11: [0, 3, 7, 10, 14, 17],
  maj11: [0, 4, 7, 11, 14, 17],
  "13": [0, 4, 7, 10, 14, 17, 21],
  m13: [0, 3, 7, 10, 14, 17, 21],
  maj13: [0, 4, 7, 11, 14, 17, 21],
};

function normalizeRoot(raw: string): string {
  return raw
    .replace("Db", "C#")
    .replace("Eb", "D#")
    .replace("Gb", "F#")
    .replace("Ab", "G#")
    .replace("Bb", "A#")
    .replace("Cb", "B")
    .replace("Fb", "E")
    .replace("E#", "F")
    .replace("B#", "C");
}

function getFormula(suffix: string): number[] | null {
  const s = suffix.toLowerCase();
  const keys = Object.keys(CHORD_FORMULAS).sort((a, b) => b.length - a.length);
  const key = keys.find((k) => s === k);
  return key ? CHORD_FORMULAS[key] : null;
}

function reduceFormula(formula: number[]): number[][] {
  const optional = [7, 14, 17, 21];
  const results: number[][] = [];
  function helper(curr: number[], idx: number) {
    const uniq = Array.from(new Set(curr));
    if (uniq.length <= 4 && uniq.length >= 3) {
      results.push(uniq);
    }
    for (let i = idx; i < optional.length; i++) {
      const iv = optional[i];
      if (curr.includes(iv)) {
        helper(curr.filter((n) => n !== iv), i + 1);
      }
    }
  }
  helper(formula, 0);
  const seen = new Set<string>();
  return results
    .filter((arr) => {
      const key = arr.join(",");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.length - a.length);
}

function searchFingering(notes: number[]): Chord | null {
  const maxFret = 12;
  for (let base = 0; base <= maxFret - 4; base++) {
    const options: number[][] = [];
    for (let s = 0; s < 6; s++) {
      const open = STRING_PITCHES[s];
      const opts = [-1];
      for (let fret = 0; fret <= maxFret; fret++) {
        const pitch = (open + fret) % 12;
        if (notes.includes(pitch)) {
          if (fret === 0) {
            if (base <= 1) opts.push(0);
          } else if (fret >= base && fret <= base + 4) {
            opts.push(fret);
          }
        }
      }
      options.push(opts);
    }
    const assign = new Array<number>(6).fill(-1);
    let result: number[] | null = null;
    function dfs(i: number, used: Set<number>) {
      if (i === 6) {
        const sounding = assign.filter((f) => f >= 0).length;
        if (sounding < 3) return;
        const covered = new Set<number>();
        for (let s = 0; s < 6; s++) {
          const fret = assign[s];
          if (fret >= 0) {
            covered.add((STRING_PITCHES[s] + fret) % 12);
          }
        }
        for (const n of notes) if (!covered.has(n)) return;
        result = assign.slice();
        return;
      }
      for (const fret of options[i]) {
        const next = new Set(used);
        if (fret > 0) next.add(fret);
        if (next.size > 4) continue;
        assign[i] = fret;
        dfs(i + 1, next);
        if (result) return;
      }
    }
    dfs(0, new Set());
    if (result) {
      const arr = result;
      const fingers: [number, number | typeof OPEN | typeof SILENT][] = [];
      for (let i = 0; i < 6; i++) {
        const fret = arr[5 - i];
        const stringNum = i + 1;
        if (fret === -1) fingers.push([stringNum, SILENT]);
        else if (fret === 0) fingers.push([stringNum, OPEN]);
        else fingers.push([stringNum, fret]);
      }
      const positives = arr.filter((f) => f > 0);
      const min = positives.length ? Math.min(...positives) : 1;
      return { fingers, barres: [], position: min > 1 ? min : 1 };
    }
  }
  return null;
}

export function getChordDiagram(name: string): Chord | null {
  const main = name.split("/")[0];
  const match = main.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return null;
  const [, rawRoot, suffix] = match;
  const root = normalizeRoot(rawRoot);
  const openName = root + suffix;
  if (OPEN_CHORDS[openName]) return OPEN_CHORDS[openName];
  const rootIndex = CHROMA.indexOf(root);
  const formula = getFormula(suffix);
  if (rootIndex < 0 || !formula) return null;
  const formulas = [formula];
  if (formula.length > 4) {
    formulas.push(...reduceFormula(formula));
  }
  for (const f of formulas) {
    const notes = Array.from(new Set(f.map((i) => (rootIndex + i) % 12)));
    const chord = searchFingering(notes);
    if (chord) return chord;
  }
  return null;
}
