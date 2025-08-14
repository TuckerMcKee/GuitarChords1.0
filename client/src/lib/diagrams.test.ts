import { test } from 'node:test';
import assert from 'node:assert';
import { normalizeRoot, getChordDiagram } from './diagrams.ts';

test('normalizeRoot handles enharmonic equivalents', () => {
  assert.strictEqual(normalizeRoot('Cb'), 'B');
  assert.strictEqual(normalizeRoot('Fb'), 'E');
  assert.strictEqual(normalizeRoot('E#'), 'F');
  assert.strictEqual(normalizeRoot('B#'), 'C');
});

test('normalizeRoot returns null for invalid inputs', () => {
  assert.strictEqual(normalizeRoot('H'), null);
  assert.strictEqual(normalizeRoot('Q#'), null);
});

test('normalizeRoot is case-insensitive', () => {
  assert.strictEqual(normalizeRoot('cb'), 'B');
  assert.strictEqual(normalizeRoot('f#'), 'F#');
});

test('getChordDiagram accepts lowercase chord names', () => {
  assert.ok(getChordDiagram('am'));
});

test('getChordDiagram surfaces error for invalid root', () => {
  const original = console.error;
  const messages: string[] = [];
  console.error = (msg?: any) => {
    messages.push(String(msg));
  };
  const result = getChordDiagram('Hmaj7');
  console.error = original;
  assert.strictEqual(result, null);
  assert.ok(messages.some((m) => m.includes('Invalid chord name')));
});

test('getChordDiagram surfaces error for invalid suffix', () => {
  const original = console.error;
  const messages: string[] = [];
  console.error = (msg?: any) => {
    messages.push(String(msg));
  };
  const result = getChordDiagram('Cxyz');
  console.error = original;
  assert.strictEqual(result, null);
  assert.ok(messages.some((m) => m.includes('Invalid chord suffix')));
});

test('getChordDiagram surfaces error when no diagram found', () => {
  const original = console.error;
  const messages: string[] = [];
  console.error = (msg?: any) => {
    messages.push(String(msg));
  };
  const result = getChordDiagram('Cmaj7', { maxFret: 1 });
  console.error = original;
  assert.strictEqual(result, null);
  assert.ok(messages.some((m) => m.includes('No chord diagram found')));
});
