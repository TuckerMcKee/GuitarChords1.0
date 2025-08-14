import { test } from "node:test";
import assert from "node:assert/strict";
import { OPEN, SILENT } from "svguitar";
import { getChordDiagram } from "../diagrams.ts";

const cases = {
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
      [2, 3],
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
  B: {
    fingers: [
      [1, 2],
      [2, 4],
      [3, 4],
      [4, 4],
      [5, 2],
      [6, SILENT],
    ],
    barres: [{ fromString: 5, toString: 1, fret: 2, text: "2" }],
  },
  Bm: {
    fingers: [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 4],
      [5, 2],
      [6, SILENT],
    ],
    barres: [{ fromString: 5, toString: 1, fret: 2, text: "2" }],
  },
  "C#m": {
    fingers: [
      [1, 4],
      [2, 5],
      [3, 6],
      [4, 6],
      [5, 4],
      [6, SILENT],
    ],
    barres: [{ fromString: 5, toString: 1, fret: 4, text: "4" }],
  },
};

for (const [name, expected] of Object.entries(cases)) {
  test(`diagram for ${name}`, () => {
    const chord = getChordDiagram(name);
    assert.deepStrictEqual(chord, expected);
  });
}
