// Chiron (2060 Chiron / 95P) positions from a bundled NASA JPL Horizons table: apparent geocentric ecliptic
// longitude of date, sampled every 5 days from 1900 to 2100 and interpolated with a four-point Lagrange
// polynomial. Fixed Keplerian elements drift by degrees over decades because Saturn and Uranus perturb Chiron
// strongly, which is why a sampled ephemeris is used instead.
import table from "./data.js";
const T = table;
/** Where the bundled table came from (JPL Horizons, with the orbit solution date). */
export const SOURCE = T.source;
export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const DAY = 86400_000;
const START = Date.parse(T.start), STEP = T.stepDays * DAY;
const norm = (x) => ((x % 360) + 360) % 360;
/** Signed shortest difference b − a in degrees, in (−180, 180]. */
const delta = (a, b) => { const d = norm(b - a); return d > 180 ? d - 360 : d; };
// Unwrapped longitudes (may exceed 360°) so interpolation never straddles 0° Aries.
const LON = (() => {
    const out = new Float64Array(T.d.length + 1);
    let u = T.first;
    out[0] = u * T.unit;
    T.d.forEach((x, i) => { u += x; out[i + 1] = u * T.unit; });
    return out;
})();
/** First and last instants the table covers (1900-01-01 to late 2100, UTC). */
export const FIRST = new Date(START);
export const LAST = new Date(START + (LON.length - 1) * STEP);
export const covers = (t) => t >= FIRST && t <= LAST;
const toMs = (t) => t instanceof Date ? t.getTime() : typeof t === 'number' ? t : Date.parse(t);
/**
 * Chiron's apparent geocentric ecliptic longitude of date, in degrees [0, 360), tropical zodiac.
 * Accepts a Date, epoch milliseconds or an ISO 8601 string (UTC). Throws RangeError outside 1900–2100.
 */
export function longitude(t) {
    const ms = toMs(t);
    if (!(ms >= START && ms <= LAST.getTime()))
        throw new RangeError('chiron-ephemeris covers 1900-01-01 to 2100-12-31 UTC');
    const x = (ms - START) / STEP;
    const i = Math.min(Math.max(Math.floor(x) - 1, 0), LON.length - 4);
    const s = x - i;
    const y0 = LON[i], y1 = LON[i + 1], y2 = LON[i + 2], y3 = LON[i + 3];
    const v = -y0 * (s - 1) * (s - 2) * (s - 3) / 6 + y1 * s * (s - 2) * (s - 3) / 2 - y2 * s * (s - 1) * (s - 3) / 2 + y3 * s * (s - 1) * (s - 2) / 6;
    return norm(v);
}
/** Apparent motion in degrees per day; negative while Chiron is retrograde. */
export function speed(t) {
    const ms = toMs(t), h = DAY / 2;
    const a = Math.max(ms - h, START), b = Math.min(ms + h, LAST.getTime());
    return delta(longitude(a), longitude(b)) / ((b - a) / DAY);
}
/** Longitude, zodiac sign, degree within the sign, speed and retrograde flag at an instant. */
export function position(t) {
    const lon = longitude(t), v = speed(t);
    const inSign = lon % 30;
    let deg = Math.floor(inSign), min = Math.round((inSign - deg) * 60);
    if (min === 60) {
        deg += 1;
        min = 0;
    }
    return { longitude: lon, sign: SIGNS[Math.floor(lon / 30)], signDegree: inSign, formatted: `${deg}°${String(min).padStart(2, '0')}′`, speed: v, retrograde: v < 0 };
}
/**
 * Instants (to the minute) when Chiron is exactly at a longitude between two dates, e.g. a Chiron return.
 * Chiron's orbit takes about 50 years, and retrograde loops can make a return exact up to three times.
 */
export function crossings(target, from, to) {
    const out = [];
    const lo0 = Math.max(toMs(from), START), hi0 = Math.min(toMs(to), LAST.getTime());
    const f = (ms) => delta(target, longitude(ms));
    let t0 = lo0, f0 = f(t0);
    for (let t1 = t0 + 2 * DAY; t1 <= hi0; t1 += 2 * DAY) {
        const f1 = f(t1);
        // A sign change of the difference near 0° (not the ±180° wrap) is a crossing.
        if (Math.sign(f0) !== Math.sign(f1) && Math.abs(f0 - f1) < 90) {
            let lo = t0, hi = t1, flo = f0;
            while (hi - lo > 60_000) {
                const mid = (lo + hi) / 2, fm = f(mid);
                if (Math.sign(fm) === Math.sign(flo)) {
                    lo = mid;
                    flo = fm;
                }
                else
                    hi = mid;
            }
            out.push(new Date(Math.round((lo + hi) / 2 / 60_000) * 60_000));
        }
        t0 = t1;
        f0 = f1;
    }
    return out;
}
/** Moments Chiron changes zodiac sign between two dates (ingresses, including retrograde re-entries). */
export function ingresses(from, to) {
    const hits = SIGNS.flatMap((_, i) => crossings(i * 30, from, to).map(at => ({ at, sign: SIGNS[speed(at) >= 0 ? i : (i + 11) % 12] })));
    return hits.sort((a, b) => a.at.getTime() - b.at.getTime());
}
