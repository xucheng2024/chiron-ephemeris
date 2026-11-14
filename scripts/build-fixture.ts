// Fetches Chiron positions from JPL Horizons at times that fall between the 5-day table samples, for
// test/accuracy.test.ts. Usage: node scripts/build-fixture.ts
const spans: [string, string, string][] = [
  ['1903-07-11 07:00', '1903-08-20', '37h'], ['1951-02-02 13:00', '1951-03-15', '41h'], ['1977-11-01 05:00', '1977-12-12', '43h'],
  ['1996-04-03 19:00', '1996-05-14', '39h'], ['2026-10-01 03:00', '2026-11-11', '47h'], ['2051-06-06 11:00', '2051-07-17', '43h'],
  ['2099-12-01 17:00', '2100-01-10', '41h'],
];
const rows: [string, number][] = [];
for (const [start, stop, step] of spans) {
  const q = new URLSearchParams({ format: 'json', COMMAND: "'2060;'", EPHEM_TYPE: 'OBSERVER', CENTER: "'500@399'", START_TIME: `'${start}'`, STOP_TIME: `'${stop}'`, STEP_SIZE: `'${step}'`, QUANTITIES: "'31'", TIME_TYPE: "'UT'", CSV_FORMAT: "'YES'" });
  const r = await (await fetch('https://ssd.jpl.nasa.gov/api/horizons.api?' + q)).json() as { result: string };
  for (const l of r.result.split('$$SOE')[1].split('$$EOE')[0].trim().split('\n')) {
    const c = l.split(',');
    const t = new Date(c[0].trim().replace(/^(\d{4})-(\w{3})-(\d{2}) (\d{2}:\d{2})$/, '$2 $3 $1 $4 UTC'));
    rows.push([t.toISOString(), +c[3]]);
  }
}
if (rows.some(([t, v]) => t.startsWith('Invalid') || Number.isNaN(v))) throw new Error('unexpected Horizons output');
const { writeFileSync } = await import('node:fs');
writeFileSync(new URL('../test/horizons-fixture.json', import.meta.url), JSON.stringify({ source: 'NASA JPL Horizons API, 2060 Chiron, quantity 31, geocentric, UT', fetched: new Date().toISOString().slice(0, 10), rows }) + '\n');
console.log(rows.length, 'rows');
