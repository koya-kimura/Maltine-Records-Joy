/**
 * Calculate the greatest common divisor of two numbers
 * @param a First number
 * @param b Second number
 * @returns GCD of a and b
 */
export function gcd(a: number, b: number): number {
    return !b ? a : gcd(b, a % b);
}

/**
 * Clamp a normalized value to [0, 0.99999999]
 * This prevents index out of bounds when mapping to array indices
 * @param x Value to clamp
 * @returns Clamped value
 */
export function clampNorm(x: number): number {
    return Math.max(Math.min(x, 0.99999999), 0.0);
}

/**
 * Convert an array of strings to a 2D array of numbers
 * Each character in the string is converted to a number
 * @param array Array of strings where each character is a digit
 * @returns 2D array of numbers
 */
export function convertTo2DArray(array: string[]): number[][] {
    const result: number[][] = [];
    for (const rowString of array) {
        const row: number[] = [];
        for (const char of rowString) {
            row.push(Number(char));
        }
        result.push(row);
    }
    return result;
}

/**
 * Check if coordinates are outside the normalized bounds [0, 1]
 * @param x X coordinate
 * @param y Y coordinate
 * @returns True if outside bounds
 */
export function isOutOfBounds(x: number, y: number): boolean {
    return x < 0 || 1.0 < x || y < 0 || 1.0 < y;
}

export function map(x: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

export function fract(x: number): number {
    return x - Math.floor(x);
}

export function clamp(x: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, x));
}   