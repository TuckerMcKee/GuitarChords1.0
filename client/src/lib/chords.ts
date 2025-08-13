export type ChordName = string;

export const KEYS = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "Db",
  "Ab",
  "Eb",
  "Bb",
  "F",
];

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

// pool of degree chains including diatonic, borrowed and secondary/tertiary dominants
const DEGREE_POOL = [
  "I",
  "ii",
  "iii",
  "IV",
  "V",
  "vi",
  "vii",
  "bII",
  "bIII",
  "bVI",
  "bVII",
  "V/ii",
  "V/iii",
  "V/IV",
  "V/V",
  "V/vi",
  "V/V/ii",
  "V/V/V",
];

const BASE_MAP: Record<string, number> = {
  I: 0,
  II: 2,
  III: 4,
  IV: 5,
  V: 7,
  VI: 9,
  VII: 11,
};

const MAJOR_SUFFIXES = ["", "7", "maj7", "9", "11", "13"];
const MINOR_SUFFIXES = ["", "7", "9", "11", "13"];

function normalizeKey(k: string) {
  return k
    .replace("Db", "C#")
    .replace("Eb", "D#")
    .replace("Gb", "F#")
    .replace("Ab", "G#")
    .replace("Bb", "A#");
}

function transpose(keyIndex: number, semis: number) {
  return CHROMA[(keyIndex + semis + 1200) % 12];
}

function getSingleDegree(token: string) {
  const m = token.match(/^([b#]*)([ivIV]+)$/);
  if (!m) return null;
  const [, acc, deg] = m;
  const base = deg.toUpperCase();
  const semisBase = BASE_MAP[base];
  if (semisBase === undefined) return null;
  let semis = semisBase;
  for (const ch of acc) semis += ch === "b" ? -1 : 1;
  const minor = deg === deg.toLowerCase();
  return { semis, minor };
}

function parseDegreeChain(chain: string) {
  const parts = chain.split("/");
  let info = getSingleDegree(parts.pop() as string);
  if (!info) return null;
  let semis = info.semis;
  let minor = info.minor;
  while (parts.length) {
    const p = getSingleDegree(parts.pop() as string);
    if (!p) return null;
    semis += p.semis;
    minor = p.minor;
  }
  semis = ((semis % 12) + 12) % 12;
  return { semis, minor };
}

export function generateProgression(key: string, length = 4): { chords: ChordName[]; roman: string } {
  const chosenKey = KEYS.includes(key) ? key : KEYS[0];
  const norm = normalizeKey(chosenKey);
  const keyIndex = CHROMA.indexOf(norm);
  const romans: string[] = [];
  const chords: string[] = [];
  for (let i = 0; i < length; i++) {
    const base = DEGREE_POOL[Math.floor(Math.random() * DEGREE_POOL.length)];
    const info = parseDegreeChain(base);
    if (!info) {
      romans.push(base);
      chords.push("");
      continue;
    }
    const suffixes = info.minor ? MINOR_SUFFIXES : MAJOR_SUFFIXES;
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const root = transpose(keyIndex, info.semis);
    let chord = `${root}${info.minor ? "m" : ""}${suffix}`;
    let roman = base + suffix;
    const invChance = Math.random();
    if (invChance < 0.33) {
      const third = transpose(keyIndex, info.semis + (info.minor ? 3 : 4));
      chord += `/${third}`;
      roman += `/${third}`;
    } else if (invChance < 0.66) {
      const fifth = transpose(keyIndex, info.semis + 7);
      chord += `/${fifth}`;
      roman += `/${fifth}`;
    }
    romans.push(roman);
    chords.push(chord);
  }
  return { chords, roman: romans.join("-") };
}
