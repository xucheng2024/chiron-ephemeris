import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FIRST, LAST, covers, crossings, ingresses, longitude, position } from '../src/index.ts';

const fixture = JSON.parse(readFileSync(new URL('./horizons-fixture.json', import.meta.url), 'utf8')) as { rows: [string, number][] };
const arcsec = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180) * 3600;

test('matches JPL Horizons between table samples to under 1 arcsecond', () => {
  let worst = 0;
  for (const [t, lon] of fixture.rows) worst = Math.max(worst, arcsec(longitude(t), lon));
  assert.ok(fixture.rows.length > 150);
  assert.ok(worst < 1, `worst difference ${worst.toFixed(3)}″`);
});

test('accepts Date, epoch ms and ISO strings alike', () => {
  const d = new Date('1990-07-04T16:00Z');
  assert.equal(longitude(d), longitude(d.getTime()));
  assert.equal(longitude(d), longitude('1990-07-04T16:00Z'));
});

test('covers 1900–2100 and rejects anything outside', () => {
  assert.equal(FIRST.toISOString(), '1900-01-01T00:00:00.000Z');
  assert.ok(LAST.getUTCFullYear() === 2100);
  assert.ok(covers(new Date('2000-01-01Z')) && !covers(new Date('1899-12-31Z')));
  assert.throws(() => longitude('2101-06-01Z'), RangeError);
  assert.throws(() => longitude('not a date'), RangeError);
});

test('reports sign, formatted degree and retrograde motion', () => {
  const p = position('1990-07-04T16:00Z');
  assert.equal(p.sign, 'Cancer');
  assert.equal(p.formatted, '18°04′');
  assert.equal(p.retrograde, false);
  // Chiron stations retrograde every year for about five months; mid-loop in late 2026 it is retrograde.
  assert.equal(position('2026-10-25T12:00Z').retrograde, true);
});

test('finds the Chiron return (about 50 years later, up to three passes)', () => {
  const natal = longitude('1990-07-04T16:00Z');
  const hits = crossings(natal, '2035-01-01Z', '2045-01-01Z');
  assert.ok(hits.length >= 1 && hits.length <= 3);
  for (const h of hits) assert.ok(arcsec(longitude(h), natal) < 5);
});

test('lists sign ingresses in order, including retrograde re-entries', () => {
  const list = ingresses('2018-01-01Z', '2020-01-01Z');
  // Chiron entered Aries in April 2018, backed into Pisces that September and re-entered Aries in February 2019.
  assert.deepEqual(list.map(x => x.sign), ['Aries', 'Pisces', 'Aries']);
  assert.equal(list[0].at.toISOString().slice(0, 7), '2018-04');
  assert.equal(list[2].at.toISOString().slice(0, 7), '2019-02');
});
