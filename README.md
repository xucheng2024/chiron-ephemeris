# chiron-ephemeris

Positions of the centaur **2060 Chiron** from 1900 to 2100, in about 90 KB (40 KB gzipped) with no dependencies.

General-purpose astronomy libraries such as Astronomy Engine leave Chiron out, and the usual alternative is the Swiss Ephemeris (AGPL or a commercial licence, plus data files). Fixed Keplerian elements drift by degrees over a few decades, because Saturn and Uranus pull Chiron's orbit around. This package ships a table from **NASA JPL Horizons** instead: Chiron's apparent geocentric ecliptic longitude of date every 5 days. It interpolates between samples with a four-point Lagrange polynomial.

**Accuracy:** at 166 times that fall between table samples (1903–2100), the largest difference from JPL Horizons is **0.22″** (arcseconds). The test suite checks this against a committed Horizons fixture.

## Install

```sh
npm install chiron-ephemeris
```

Or in the browser, straight from GitHub via jsDelivr:

```js
import { position } from 'https://cdn.jsdelivr.net/gh/xucheng2024/chiron-ephemeris@v1.0.0/dist/index.js';
```

## Use

```js
import { longitude, position, crossings, ingresses } from 'chiron-ephemeris';

position('1990-07-04T16:00Z');
// { longitude: 108.065…, sign: 'Cancer', signDegree: 18.065…, formatted: '18°04′', speed: 0.06…, retrograde: false }

// Chiron return: when Chiron comes back to its birth longitude (about age 50, sometimes three passes)
crossings(longitude('1990-07-04T16:00Z'), '2035-01-01', '2045-01-01');

// Sign changes, including retrograde re-entries
ingresses('2018-01-01', '2027-01-01');
// Aries 2018-04-17, Pisces 2018-09-26, Aries 2019-02-18, Taurus 2026-06-19, Aries 2026-09-18
```

Times can be a `Date`, epoch milliseconds or an ISO 8601 string, all UTC. Outside 1900-01-01 to 2100-12-31 the functions throw a `RangeError`.

| Export | Returns |
| --- | --- |
| `longitude(t)` | Ecliptic longitude of date in degrees, 0–360 (tropical zodiac, 0 = 0° Aries) |
| `speed(t)` | Degrees per day; negative while retrograde |
| `position(t)` | `{ longitude, sign, signDegree, formatted, speed, retrograde }` |
| `crossings(lon, from, to)` | Every instant (to the minute) Chiron is exactly at `lon` |
| `ingresses(from, to)` | `{ at, sign }[]` for each sign change |
| `FIRST`, `LAST`, `covers(t)` | Table range |
| `SOURCE` | The Horizons query and orbit solution the table came from |

## What the numbers mean

- **Geocentric, apparent, of date:** the position as seen from Earth's centre, corrected for light time and aberration, measured on the ecliptic and equinox of that date. That is what astrology software calls the tropical zodiac position.
- **No topocentric correction.** Chiron is far enough away that the observer's location changes its longitude by well under an arcsecond.

## Rebuilding the data

```sh
npm run data      # re-downloads the 5-day table from JPL Horizons into src/data.ts
npm run fixture   # re-downloads the off-grid check points into test/horizons-fixture.json
npm test
```

## Who made this

It is extracted from [Natal Chart Lab](https://natalchartlab.com), whose [Chiron calculator](https://natalchartlab.com/chiron-calculator) uses this code. The site's [methodology page](https://natalchartlab.com/methodology) and [accuracy check against JPL Horizons](https://natalchartlab.com/articles/checking-birth-chart-calculator-jpl-horizons) cover the rest of its calculations.

Ephemeris data: NASA JPL Horizons (Solar System Dynamics Group, Jet Propulsion Laboratory). Code: MIT.
