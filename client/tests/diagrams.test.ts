import { test } from 'node:test';
import assert from 'node:assert';
import { getChordDiagram } from '../src/lib/diagrams.js';
import { OPEN } from 'svguitar';

test('produces low-position open fingering for Cmaj9', () => {
  const chord = getChordDiagram('Cmaj9');
  assert.ok(chord);
  const frets = chord!.fingers
    .filter(([, f]) => typeof f === 'number' && (f as number) > 0)
    .map(([, f]) => f as number);
  const max = frets.length ? Math.max(...frets) : 0;
  const min = frets.length ? Math.min(...frets) : 0;
  const span = max - min;
  const openCount = chord!.fingers.filter(([, f]) => f === OPEN).length;
  assert.ok(max <= 7);
  assert.ok(span <= 4);
  assert.ok(openCount > 0);
});

test('respects maxSpan option for Cmaj9', () => {
  const chord = getChordDiagram('Cmaj9', { maxSpan: 0 });
  assert.ok(chord);
  const frets = chord!.fingers
    .filter(([, f]) => typeof f === 'number' && (f as number) > 0)
    .map(([, f]) => f as number);
  const span = frets.length ? Math.max(...frets) - Math.min(...frets) : 0;
  assert.strictEqual(span, 0);
});
