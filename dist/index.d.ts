/** Where the bundled table came from (JPL Horizons, with the orbit solution date). */
export declare const SOURCE: string;
export declare const SIGNS: readonly ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
export type Sign = typeof SIGNS[number];
/** First and last instants the table covers (1900-01-01 to late 2100, UTC). */
export declare const FIRST: Date;
export declare const LAST: Date;
export declare const covers: (t: Date) => boolean;
/**
 * Chiron's apparent geocentric ecliptic longitude of date, in degrees [0, 360), tropical zodiac.
 * Accepts a Date, epoch milliseconds or an ISO 8601 string (UTC). Throws RangeError outside 1900–2100.
 */
export declare function longitude(t: Date | number | string): number;
/** Apparent motion in degrees per day; negative while Chiron is retrograde. */
export declare function speed(t: Date | number | string): number;
export interface Position {
    /** Ecliptic longitude, degrees [0, 360). */
    longitude: number;
    sign: Sign;
    /** Degree within the sign, 0–30. */
    signDegree: number;
    /** e.g. "28°22′" */
    formatted: string;
    speed: number;
    retrograde: boolean;
}
/** Longitude, zodiac sign, degree within the sign, speed and retrograde flag at an instant. */
export declare function position(t: Date | number | string): Position;
/**
 * Instants (to the minute) when Chiron is exactly at a longitude between two dates, e.g. a Chiron return.
 * Chiron's orbit takes about 50 years, and retrograde loops can make a return exact up to three times.
 */
export declare function crossings(target: number, from: Date | number | string, to: Date | number | string): Date[];
/** Moments Chiron changes zodiac sign between two dates (ingresses, including retrograde re-entries). */
export declare function ingresses(from: Date | number | string, to: Date | number | string): {
    at: Date;
    sign: Sign;
}[];
